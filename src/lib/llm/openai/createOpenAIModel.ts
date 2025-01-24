import { ChatOpenAI } from '@langchain/openai'
import { Client } from 'langsmith'
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain"
import { type CreateOpenAIModelConfig, type OpenAIModelConfig } from './types'
import { OPENAI_CONFIG, OPENAI_MODELS, MODEL_VERSIONS } from './constants'
import { isNil } from 'lodash'

/**
 * Creates a configured OpenAI model instance with proper tracing metadata
 * Settings can optionally include openAiApiKey, otherwise falls back to environment configuration
 * 
 * @param config - Configuration for model creation
 * @returns Configured model, metadata for tracing, and optional callbacks for hiding data
 * @throws Error if no API key is available in either settings or environment
 * 
 * @example
 * ```typescript
 * const { model, metadata, callbacks } = await createOpenAIModel({
 *   settings,
 *   helpers,
 *   payload,
 *   modelType: OPENAI_MODELS.GPT4oMini,
 *   hideDataForTracing: true
 * })
 * ```
 */
export const createOpenAIModel = async ({
  settings = {},
  helpers,
  payload,
  modelType = OPENAI_MODELS.GPT4oMini,
  hideDataForTracing = false,
}: CreateOpenAIModelConfig & { hideDataForTracing?: boolean }): Promise<OpenAIModelConfig> => {
  const apiKey = settings.openAiApiKey ?? helpers.getOpenAIConfig().apiKey

  if (isNil(apiKey)) {
    throw new Error('No OpenAI API key available in settings or environment configuration')
  }

  const model = new ChatOpenAI({
    modelName: MODEL_VERSIONS[modelType],
    openAIApiKey: apiKey,
    ...OPENAI_CONFIG
  })

  let callbacks;
  if (hideDataForTracing) {
    const client = new Client({
      hideInputs: () => ({}),
      hideOutputs: () => ({})
    })
    callbacks = [new LangChainTracer({ client })]
  }

  return {
    model,
    metadata: {
      tenant_id: payload.pathway.tenant_id ?? '',
      care_flow_definition_id: payload.pathway.definition_id ?? '',
      care_flow_id: payload.pathway.id ?? '',
      activity_id: payload.activity.id ?? ''
    },
    callbacks // if not hideDataForTracing, callbacks is undefined, will use default callbacks
  }
}