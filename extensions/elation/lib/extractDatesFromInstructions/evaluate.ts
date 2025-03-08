import { ChatOpenAI } from '@langchain/openai'
import { Client } from 'langsmith'
import {
  evaluate,
  type EvaluationResult,
  type EvaluatorT,
} from 'langsmith/evaluation'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai'
import { parser } from './parser'
import { systemPrompt } from './prompt'

import { differenceInMinutes, parseISO } from 'date-fns'
import dotenv from 'dotenv'

dotenv.config()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const langsmith = new Client({
  apiKey: process.env.LANGSMITH_API_KEY,
  apiUrl: process.env.LANGSMITH_ENDPOINT,
})

interface Inputs {
  instructions: string
  reference_date: string
}

interface Outputs {
  from: string | null | undefined
  to: string | null | undefined
}

// Define the application logic you want to evaluate inside a target function
// The SDK will automatically send the inputs from the dataset to your target function
async function wrapper(inputs: Inputs): Promise<Outputs> {
  const model = new ChatOpenAI({
    modelName: OPENAI_MODELS.GPT4o,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const chain = model.pipe(parser)

  const result = await chain.invoke(
    await systemPrompt.format({
      currentDateTime: inputs.reference_date,
      prompt: inputs.instructions,
    }),
  )

  return {
    from: result.from,
    to: result.to,
  }
}

const evaluator: EvaluatorT = async ({
  outputs,
  referenceOutputs,
}: {
  outputs: Record<string, any>
  referenceOutputs?: Record<string, any>
}): Promise<EvaluationResult> => {
  const isCorrect =
    differenceInMinutes(
      parseISO(outputs.from),
      parseISO(referenceOutputs?.from),
    ) < 1 &&
    differenceInMinutes(parseISO(outputs.to), parseISO(referenceOutputs?.to)) <
      1
  return {
    key: 'extract_dates_from_instructions',
    score: isCorrect ? 1 : 0,
  }
}

async function runEvaluation(): Promise<void> {
  try {
    console.log('🚀 Running evaluation...\n')
    const results = await evaluate(wrapper, {
      data: 'ai-actions-extract-date-instructions',
      evaluators: [evaluator],
      experimentPrefix: 'ExtractDatesFromInstructions',
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

void runEvaluation()
