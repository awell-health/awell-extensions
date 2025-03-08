import type { BaseCallbackHandler } from '@langchain/core/callbacks/base'
import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../src/lib/llm/openai/types'
import { parser, type DateFilterFromLLM } from './parser'
import { systemPrompt } from './prompt'

interface ExtractDatesFromInstructionsProps {
  model: ChatOpenAI
  prompt: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}

export const extractDatesFromInstructions = async ({
  model,
  prompt,
  metadata,
  callbacks,
}: ExtractDatesFromInstructionsProps): Promise<DateFilterFromLLM> => {
  const chain = model.pipe(parser)

  try {
    const result = await chain.invoke(
      await systemPrompt.format({
        currentDateTime: new Date().toISOString(),
        prompt,
      }),
      {
        metadata,
        runName: 'ElationExtractDatesFromInstructions',
        callbacks,
      },
    )

    return {
      from: result.from,
      to: result.to,
    }
  } catch (error) {
    throw new Error('Failed to extract dates from instructions.')
  }
}
