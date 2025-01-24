import { ChatOpenAI } from '@langchain/openai'
import { type CreateOpenAIModelConfig, type OpenAIModelConfig } from './types'
import { OPENAI_CONFIG, OPENAI_MODELS, MODEL_VERSIONS } from './constants'
import { isNil } from 'lodash'

/**
 * Creates a configured OpenAI model instance with proper tracing metadata
 * 
 * @param config - Configuration for model creation
 * @returns Configured model and metadata for tracing
 * @throws Error if no API key is available
 * 
 * @example
 * ```typescript
 * const { model, metadata } = await createOpenAIModel({
 *   settings,
 *   helpers,
 *   payload,
 *   modelType: OPENAI_MODELS.GPT4oMini
 * })
 * ```
 */
export const createOpenAIModel = async ({
  settings,
  helpers,
  payload,
  modelType = OPENAI_MODELS.GPT4oMini
}: CreateOpenAIModelConfig): Promise<OpenAIModelConfig> => {
  // Get API key with proper fallback logic
  const apiKey = settings.openAiApiKey ?? helpers.getOpenAIConfig().apiKey

  if (isNil(apiKey)) {
    throw new Error('No OpenAI API key available')
  }

  // Create model instance with standard configuration
  const model = new ChatOpenAI({
    modelName: MODEL_VERSIONS[modelType], // Maps 'gpt-4o-mini' to 'gpt-4o-mini-2024-07-18'
    openAIApiKey: apiKey,  // Fixed: no more .key
    ...OPENAI_CONFIG
  })

  // Return configured model and tracing metadata
  return {
    model,
    metadata: {
      care_flow_definition_id: payload.pathway.definition_id ?? '',
      care_flow_id: payload.pathway.id ?? '',
      activity_id: payload.activity.id ?? '',
    }
  }
}