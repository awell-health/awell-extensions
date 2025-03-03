import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import type { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { systemPrompt } from './prompt'
import { parser, type CheckTagsOutput } from './parser'

interface CheckTagsWithLLMProps {
  model: ChatOpenAI
  existingTags: string[]
  instructions: string
  metadata: AIActionMetadata
  callbacks?: BaseCallbackHandler[]
}

export const checkTagsWithLLM = async (props: CheckTagsWithLLMProps): Promise<CheckTagsOutput> => {
  const { model, existingTags, instructions, metadata, callbacks } = props

  try {
    const chain = model.pipe(parser)
    const formattedPrompt = await systemPrompt.format({
      existingTags: JSON.stringify(existingTags),
      instructions
    })
    const result = await chain.invoke(
      formattedPrompt, 
      { 
        metadata, 
        runName: 'ElationCheckPatientTags',
        callbacks
      }
    )

    return {
      tagsFound: result.tagsFound,
      explanation: result.explanation
    }
  } catch (error) {
    throw new Error('Failed to check patient tags.')
  }
} 