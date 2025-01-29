/**
 * Default configuration settings for OpenAI model calls.
 * - temperature: 0 (most deterministic outputs)
 * - maxRetries: 3 (automatic retry on transient failures) 
 * - timeout: 10000ms (10 second timeout for responses)
 */
export const OPENAI_CONFIG = {
  temperature: 0,
  maxRetries: 5,
  timeout: 30000,
} as const

/**
 * Simplified model aliases for easier reference in code.
 * Use these constants instead of raw strings when specifying models.
 */
export const OPENAI_MODELS = {
  GPT4o: 'gpt-4o',
  GPT4oMini: 'gpt-4o-mini',
} as const

/**
 * Maps model aliases to specific versioned model names.
 * Always use versioned snapshots rather than base model names to ensure
 * consistent behavior over time as models are updated.
 */
export const MODEL_VERSIONS = {
  [OPENAI_MODELS.GPT4o]: 'gpt-4o-2024-08-06',
  [OPENAI_MODELS.GPT4oMini]: 'gpt-4o-mini-2024-07-18',
} as const 