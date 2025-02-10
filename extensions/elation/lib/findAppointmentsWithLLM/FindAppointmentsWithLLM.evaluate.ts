/**
 * LangSmith Evaluation Script for findAppointmentsWithLLM
 *
 * Evaluates the findAppointmentsWithLLM function by:
 * - Running test cases from LangSmith dataset
 * - Comparing generated appointments against expected appointments
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
 * yarn ts-node extensions/elation/lib/findAppointmentsWithLLM/findAppointmentsWithLLM.evaluate.ts
 *
 * Results can be viewed in LangSmith dashboard:
 * https://smith.langchain.com/o/3fffae83-70ff-4574-81ba-aaaedf0b4dc5/datasets/745cea13-3379-463f-9a8a-c6b10e29b8f6
 *
 *  * ⚠️ **Note:** This script does NOT run in CI/CD. It is meant for **manual evaluation** before merging PRs (for now)
 */
import { Client, type Example } from 'langsmith'
import { evaluate } from 'langsmith/evaluation'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { findAppointmentsWithLLM } from './findAppointmentsWithLLM'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import type { AppointmentsFromLLM } from './parser'
import { isNil } from 'lodash'
import type { AppointmentResponse } from '../../types/appointment'

import dotenv from 'dotenv'
dotenv.config()

const langsmith = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
  apiUrl: process.env.LANGSMITH_ENDPOINT,
})

// Define the dataset name
const datasetName = 'ai-actions-find-appointments-elation'

interface EvaluatorInput {
  outputs: Record<string, unknown>
  referenceOutputs?: Record<string, unknown>
}

interface EvaluatorOutput {
  key: string
  score: number
  metadata?: Record<string, unknown>
}

interface DatasetExample {
  instruction: string
  input_appointments: AppointmentResponse[]
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

// Custom evaluator to compare generated appointments with expected appointments
const appointmentsMatchEvaluator = async ({
  outputs,
  referenceOutputs,
}: EvaluatorInput): Promise<EvaluatorOutput> => {
  
  const generatedAppointmentIds = outputs?.appointmentIds as number[]
  const expectedAppointmentIds = referenceOutputs?.expected_output_appointment_ids as number[]

  const isEqual =
    Array.isArray(generatedAppointmentIds) &&
    Array.isArray(expectedAppointmentIds) &&
    generatedAppointmentIds.length === expectedAppointmentIds.length &&
    generatedAppointmentIds.every((id, index) => id === expectedAppointmentIds[index])

  return { 
    key: 'appointments_match', 
    score: isEqual ? 1 : 0,
    metadata: {
      generatedIds: generatedAppointmentIds,
      expectedIds: expectedAppointmentIds
    }
  }
}

// Wrapper function to adapt findAppointmentsWithLLM for evaluation
const findAppointmentsWithLLMWrapper = async (
  input: DatasetExample,
): Promise<AppointmentsFromLLM> => {
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

  return await findAppointmentsWithLLM({
    model,
    appointments: input.input_appointments,
    prompt: input.instruction,
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
    const results = await evaluate(findAppointmentsWithLLMWrapper, {
      data: testExamples,
      evaluators: [appointmentsMatchEvaluator],
      experimentPrefix: 'FindAppointmentsWithLLM Evaluation',
      maxConcurrency: 16,
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
