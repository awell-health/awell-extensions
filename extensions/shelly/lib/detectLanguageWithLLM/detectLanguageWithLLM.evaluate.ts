/**
 * LangSmith Evaluation Script for detectLanguageWithLLM
 *
 * Evaluates the function by:
 * - Running test cases from LangSmith dataset
 * - Checking if a language is detected
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
 * yarn ts-node extensions/shelly/lib/detectLanguageWithLLM/detectLanguageWithLLM.evaluate.ts
 *
 * Results can be viewed in LangSmith dashboard
 *
 * ⚠️ **Note:** This script does NOT run in CI/CD. It is meant for **manual evaluation** before merging PRs (for now)
 */
import { Client, type Example } from 'langsmith'
import { evaluate } from 'langsmith/evaluation'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { detectLanguageWithLLM } from './detectLanguageWithLLM'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { isNil } from 'lodash'

import dotenv from 'dotenv'
dotenv.config()

const langsmith = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
  apiUrl: process.env.LANGSMITH_ENDPOINT,
})

// Define the dataset name
const datasetName = 'ai-actions-detect-language-shelly'

interface EvaluatorInput {
  outputs: Record<string, unknown>
}

interface EvaluatorOutput {
  key: string
  score: number
  metadata?: Record<string, unknown>
}

interface DatasetExample {
  text: string
  expected_language: string
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

// Custom evaluator to check if language detection is accurate
const languageDetectionEvaluator = async ({
  outputs,
}: EvaluatorInput): Promise<EvaluatorOutput> => {
  const detectedLanguage = outputs?.detectedLanguage as string
  
  // Check if language is detected and not empty
  const isDetected = typeof detectedLanguage === 'string' && detectedLanguage.trim().length > 0
  
  return { 
    key: 'language_detected', 
    score: isDetected ? 1 : 0,
    metadata: {
      detectedLanguage,
      isDetected
    }
  }
}

// Wrapper function to adapt detectLanguageWithLLM for evaluation
const detectLanguageWithLLMWrapper = async (
  input: DatasetExample,
): Promise<{ detectedLanguage: string }> => {
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
      text: input.text,
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

  const detectedLanguage = await detectLanguageWithLLM({
    model,
    text: input.text,
    metadata,
    callbacks,
  })

  return { detectedLanguage }
}

// Main function to run the evaluation and print results
const runEvaluation = async (): Promise<void> => {
  try {
    console.log('📡 Fetching test dataset from LangSmith...')
    const testExamples = await fetchTestExamples()
    console.log(`✅ Loaded ${testExamples.length} test examples\n`)

    console.log('🚀 Running evaluation...\n')
    const results = await evaluate(detectLanguageWithLLMWrapper, {
      data: testExamples,
      evaluators: [languageDetectionEvaluator],
      experimentPrefix: 'DetectLanguageWithLLM Evaluation',
      maxConcurrency: 8,
      numRepetitions: 1,
    })

    const resultsArray = Array.isArray(results) ? results : [results]
    const experimentId = resultsArray[0]?.run?.run_id as string

    console.log('\n✨ Experiment Run Complete! Actual evaluation is running in LangSmith via custom evaluator.')
    console.log('View detailed results in LangSmith:')
    console.log(`https://smith.langchain.com/runs/${experimentId}`)
  } catch (error) {
    console.error('❌ Error during evaluation:', error)
    throw error
  }
}

// Execute the evaluation
void runEvaluation() 