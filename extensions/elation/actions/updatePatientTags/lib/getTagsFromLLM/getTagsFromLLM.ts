import { type ChatOpenAI } from '@langchain/openai'
import { type AIActionMetadata } from '../../../../../../src/lib/llm/openai/types'
import { systemPrompt } from './prompt'
import { parser, type TagsFromAI } from './parser'

interface GetTagsFromLLMProps {
  model: ChatOpenAI
  existingTags: string[]
  prompt: string
  metadata: AIActionMetadata
}

export const getTagsFromLLM = async (props: GetTagsFromLLMProps): Promise<TagsFromAI> => {
  const { model, existingTags, prompt, metadata } = props

  try {
    const chain = model.pipe(parser)
    const formattedPrompt = await systemPrompt.format({
      existingTags: JSON.stringify(existingTags),
      prompt
    })
    const result = await chain.invoke(formattedPrompt, { metadata, runName: 'ElationUpdatePatientTags' })

    return {
      validatedTags: result.updatedTags,
      explanation: result.explanation
    }
  } catch (error) {
    console.error(
      'Error in getTagsFromLLM:',
      error,
      metadata
    )
    throw new Error('Failed to update patient tags.')
  }
} 