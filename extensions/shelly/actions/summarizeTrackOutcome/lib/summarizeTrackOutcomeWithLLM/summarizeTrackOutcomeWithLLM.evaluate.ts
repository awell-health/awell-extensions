/**
 * LangSmith Evaluation Script for summarizeTrackOutcomeWithLLM
 *
 * Evaluates the summarizeTrackOutcomeWithLLM function by:
 * - Running test cases from LangSmith dataset
 * - Checking if a summary is provided
 * - Generating evaluation reports
 *
 * Requirements:
 * - Set environment variables in .env:
 *   - OPENAI_API_KEY
 *   - LANGSMITH_API_KEY
 *   - LANGSMITH_TRACING=true
 *   - LANGSMITH_PROJECT=ai-actions-local
 *
 * Usage:
 * yarn ts-node extensions/shelly/actions/summarizeTrackOutcome/lib/summarizeTrackOutcomeWithLLM/summarizeTrackOutcomeWithLLM.evaluate.ts
 *
 * Results can be viewed in LangSmith dashboard
 *
 * ⚠️ **Note:** This script does NOT run in CI/CD. It is meant for **manual evaluation** before merging PRs (for now)
 */
import { Client, type Example } from 'langsmith'
import { evaluate } from 'langsmith/evaluation'
import { createOpenAIModel } from '../../../../../../src/lib/llm/openai/createOpenAIModel'
import { summarizeTrackOutcomeWithLLM } from './summarizeTrackOutcomeWithLLM'
import { OPENAI_MODELS } from '../../../../../../src/lib/llm/openai/constants'
import { isNil } from 'lodash'

import dotenv from 'dotenv'
dotenv.config()

const langsmith = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
  apiUrl: process.env.LANGSMITH_ENDPOINT,
})

// Define the dataset name
const datasetName = 'ai-actions-summarize-track_outcome-shelly'

interface EvaluatorInput {
  outputs: Record<string, unknown>
}

interface EvaluatorOutput {
  key: string
  score: number
  metadata?: Record<string, unknown>
}

interface DatasetExample {
  instruction: string
  track_data: string
}

// Fetch the 'test' split examples from the dataset
const fetchTestExamples = async (): Promise<Example[]> => {
  try {
    const testExamples = langsmith.listExamples({
      datasetName,
      splits: ['test'],
    })
    const examples: Example[] = []
    for await (const example of testExamples) {
      if (!isNil(example.inputs)) {
        // Explicit null check
        examples.push(example)
      }
    }
    return examples
  } catch (error) {
    console.error('❌ Error fetching test examples:', error)
    throw error
  }
}

// Custom evaluator to check if a summary is provided
// Actual evaluation will be run automatically in LangSmith by LLM as a judge
// TODO: right now we are usign gpt4o as a judge as well - not problematic but not great either - same models tend to prefer each other styles
// once o3 supported (issue with temperature resolved and reasoning type enabled) we should use o3 as a judge
const summaryProvidedEvaluator = async ({
  outputs,
}: EvaluatorInput): Promise<EvaluatorOutput> => {
  const summary = outputs?.summary as string
  
  // Check if summary is provided and not empty
  const isProvided = typeof summary === 'string' && summary.trim().length > 0
  
  return { 
    key: 'summary_provided', 
    score: isProvided ? 1 : 0,
    metadata: {
      summaryLength: typeof summary === 'string' ? summary.length : 0,
      hasSummary: isProvided
    }
  }
}

// Wrapper function to adapt summarizeTrackOutcomeWithLLM for evaluation
const summarizeTrackOutcomeWithLLMWrapper = async (
  input: DatasetExample,
): Promise<{ summary: string }> => {
  const payload = {
    activity: {
      id: 'test-activity-id',
    },
    pathway: {
      tenant_id: 'test-tenant',
      definition_id: 'test-definition',
      id: 'test-pathway',
      org_slug: 'test-org',
      org_id: 'test-org-id',
    },
    fields: {
      instructions: input.instruction,
    },
    settings: {
      openAiApiKey: process.env.OPENAI_API_KEY,
    },
  }

  const helpers = {
    getOpenAIConfig: () => {
      const apiKey = process.env.OPENAI_API_KEY
      if (isNil(apiKey) || apiKey.trim() === '') {
        throw new Error('OPENAI_API_KEY is required but not set')
      }
      return { apiKey }
    },
  }

  const { model, metadata, callbacks } = await createOpenAIModel({
    settings: payload.settings,
    helpers,
    payload,
    modelType: OPENAI_MODELS.GPT4o,
  })

  const summary = await summarizeTrackOutcomeWithLLM({
    model,
    trackActivities: input.track_data,
    instructions: input.instruction,
    metadata,
    callbacks,
  })

  return { summary }
}

// Main function to run the evaluation and print results
const runEvaluation = async (): Promise<void> => {
  try {
    console.log('📡 Fetching test dataset from LangSmith...')
    const testExamples = await fetchTestExamples()
    console.log(`✅ Loaded ${testExamples.length} test examples\n`)

    console.log('🚀 Running evaluation...\n')
    const results = await evaluate(summarizeTrackOutcomeWithLLMWrapper, {
      data: testExamples,
      evaluators: [summaryProvidedEvaluator],
      experimentPrefix: 'SummarizeTrackOutcomeWithLLM Evaluation',
      maxConcurrency: 4,
    })

    const resultsArray = Array.isArray(results) ? results : [results]
    const experimentId = resultsArray[0]?.run?.run_id as string

    console.log('\n✨ Evaluation Complete!')
    console.log('View detailed results in LangSmith:')
    console.log(`https://smith.langchain.com/runs/${experimentId}`)
  } catch (error) {
    console.error('❌ Error during evaluation:', error)
    throw error
  }
}

// Execute the evaluation
void runEvaluation() 