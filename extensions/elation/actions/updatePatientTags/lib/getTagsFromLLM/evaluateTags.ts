/**
 * LangSmith Evaluation Script for getTagsFromLLM
 *
 * Evaluates the getTagsFromLLM function by:
 * - Running test cases from LangSmith dataset
 * - Comparing generated tags against expected tags
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
 * node getTagsFromLLM/evaluateTags.ts
 *
 * Results can be viewed in LangSmith dashboard:
 * https://smith.langchain.com/o/3fffae83-70ff-4574-81ba-aaaedf0b4dc5/datasets/745cea13-3379-463f-9a8a-c6b10e29b8f6
 *
 *  * ⚠️ **Note:** This script does NOT run in CI/CD. It is meant for **manual evaluation** before merging PRs (for now)
 */

import { Client, type Example } from 'langsmith'
import { evaluate } from 'langsmith/evaluation'
import { createOpenAIModel } from '../../../../../../src/lib/llm/openai/createOpenAIModel'
import { getTagsFromLLM } from './getTagsFromLLM'
import { OPENAI_MODELS } from '../../../../../../src/lib/llm/openai/constants'
import type { TagsFromAI } from './parser.js'
import { isNil } from 'lodash'

import dotenv from 'dotenv'
dotenv.config()

const langsmith = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
  apiUrl: process.env.LANGSMITH_ENDPOINT,
})

// Define the dataset name
const datasetName = 'ai-actions-update-patient-tags-elation'

interface EvaluatorInput {
  outputs: Record<string, unknown>
  referenceOutputs?: Record<string, unknown>
}

interface EvaluatorOutput {
  key: string
  score: number
}

interface DatasetExample {
  instruction: string
  input_patient_tags: string[]
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
      if (!isNil(example.inputs) && !isNil(example.outputs)) {
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

// Custom evaluator to compare generated tags with expected tags
const tagsMatchEvaluator = async ({
  outputs,
  referenceOutputs,
}: EvaluatorInput): Promise<EvaluatorOutput> => {
  console.log('Evaluator received:', { outputs, referenceOutputs }) // Debug log

  const generatedTags = outputs?.validatedTags as string[]
  const expectedTags = referenceOutputs?.expected_updated_tags as string[]

  // console.log('Comparing tags:', { generatedTags, expectedTags }); // Debug log

  const isEqual =
    Array.isArray(generatedTags) &&
    Array.isArray(expectedTags) &&
    generatedTags.length === expectedTags.length &&
    generatedTags.every((tag, index) => tag === expectedTags[index])

  return { key: 'tags_match', score: isEqual ? 1 : 0 }
}

// Wrapper function to adapt getTagsFromLLM for evaluation
const getTagsFromLLMWrapper = async (
  input: DatasetExample,
): Promise<TagsFromAI> => {
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
      patientId: 'test-patient',
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

  return await getTagsFromLLM({
    model,
    existingTags: input.input_patient_tags,
    instructions: input.instruction,
    metadata,
    callbacks,
  })
}

// Main function to run the evaluation and print results
const runEvaluation = async (): Promise<void> => {
  try {
    console.log('📡 Fetching test dataset from LangSmith...')
    const testExamples = await fetchTestExamples()
    console.log(`✅ Loaded ${testExamples.length} test examples\n`)

    console.log('🚀 Running evaluation...\n')
    const results = await evaluate(getTagsFromLLMWrapper, {
      data: testExamples,
      evaluators: [tagsMatchEvaluator],
      experimentPrefix: 'GetTagsFromLLM Evaluation',
      maxConcurrency: 4,
    })

    const resultsArray = Array.isArray(results) ? results : [results]
    const experimentId = resultsArray[0]?.run?.run_id as string

    if (!isNil(experimentId) && experimentId.trim() !== '') {
      console.log('\n✨ Evaluation Complete!')
      console.log('View detailed results in LangSmith:')
      console.log(`https://smith.langchain.com/runs/${experimentId}`)
    }
  } catch (error) {
    console.error('❌ Error during evaluation:', error)
    throw error
  }
}

// Execute the evaluation
void runEvaluation()
