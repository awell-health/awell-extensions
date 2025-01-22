import { ChatOpenAI } from '@langchain/openai'
import { createTagsUpdatePrompt } from './createPrompt'
import { parser, type TagsFromAI, type TagsOutput, TagsSchema } from './config/types'
import type { OpenAIConfig } from '@awell-health/extensions-core/dist/types/Helpers'

interface GetTagsFromAIProps {
    apiKey: string
    openAiConfig: OpenAIConfig
    existingTags: string[]
    prompt: string
}

export const getTagsFromAI = async (props: GetTagsFromAIProps): Promise<TagsFromAI> => {
    const { apiKey, openAiConfig, existingTags, prompt } = props

    const ChatModelGPT4o = new ChatOpenAI({
        modelName: 'gpt-4o-2024-08-06',
        openAIApiKey: apiKey,
        temperature: openAiConfig.temperature,
        maxRetries: openAiConfig.maxRetries,
        timeout: openAiConfig.timeout,
      })
  
      const systemPrompt = createTagsUpdatePrompt(existingTags, prompt)

      let result: TagsOutput
  
      try {
        const chain = ChatModelGPT4o.pipe(parser)
        result = await chain.invoke(systemPrompt)
      } catch (invokeError) {
        console.error(
          'Error invoking ChatModelGPT4o for updatePatientTags:',
          invokeError,
        )
        throw new Error('Failed to update patient tags.')
      }
  
      return {
        validatedTags: TagsSchema.parse(result.updatedTags),
        explanation: result.explanation
      }
}

