import { type ChatOpenAIFields } from '@langchain/openai'
import { type OpenAIModelType } from './types'

export const getDefaultConfig = (
  modelType: OpenAIModelType,
): Partial<ChatOpenAIFields> => {
  switch (modelType) {
    case OPENAI_MODELS.GPT5Mini:
      return {
        temperature: 1,
        maxRetries: 5,
        timeout: 30000,
      }
    default:
      return {
        temperature: 0,
        maxRetries: 5,
        timeout: 30000,
      }
  }
}

/**
 * Simplified model aliases for easier reference in code.
 * Use these constants instead of raw strings when specifying models.
 */
export const OPENAI_MODELS = {
  GPT4o: 'gpt-4o',
  GPT4oMini: 'gpt-4o-mini',
  GPT5Mini: 'gpt-5-mini',
} as const

/**
 * Maps model aliases to specific versioned model names.
 * Always use versioned snapshots rather than base model names to ensure
 * consistent behavior over time as models are updated.
 */
export const MODEL_VERSIONS = {
  [OPENAI_MODELS.GPT4o]: 'gpt-4o-2024-08-06',
  [OPENAI_MODELS.GPT4oMini]: 'gpt-4o-mini-2024-07-18',
  [OPENAI_MODELS.GPT5Mini]: 'gpt-5-mini-2025-08-07',
} as const
