import { type ChatOpenAIFields } from '@langchain/openai'
import { type OpenAIModelType } from './types'

export const getDefaultConfig = (
  modelType: OpenAIModelType,
): Partial<ChatOpenAIFields> => {
  switch (modelType) {
    case OPENAI_MODELS.GPT5Mini:
      return {
        temperature: 1,
        maxRetries: 3,
        // 60s per-request ceiling. gpt-5-mini is a reasoning model and a single
        // generation can exceed the previous 30s limit, causing every retry to
        // time out and the action to fail after ~2min. See summarizeForm.
        timeout: 60000,
      }
    default:
      return {
        temperature: 0,
        maxRetries: 3,
        timeout: 60000,
      }
  }
}

/**
 * Simplified model aliases for easier reference in code.
 * Use these constants instead of raw strings when specifying models.
 */
export const OPENAI_MODELS = {
  GPT5Mini: 'gpt-5-mini',
} as const

/**
 * Maps model aliases to specific versioned model names.
 * Always use versioned snapshots rather than base model names to ensure
 * consistent behavior over time as models are updated.
 */
export const MODEL_VERSIONS = {
  [OPENAI_MODELS.GPT5Mini]: 'gpt-5-mini-2025-08-07',
} as const
