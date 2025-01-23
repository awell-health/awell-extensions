/** Standard configuration for OpenAI models */
export const OPENAI_CONFIG = {
  temperature: 0,
  maxRetries: 3,
  timeout: 10000,
} as const

/** Simple model names for easy reference */
export const OPENAI_MODELS = {
  GPT4o: 'gpt-4o',
  GPT4oMini: 'gpt-4o-mini',
} as const

/** Internal mapping to versioned model names */
// it is important to always ste the model snapshot, not just model name as it might change and with that its behavior
export const MODEL_VERSIONS = {
  [OPENAI_MODELS.GPT4o]: 'gpt-4o-2024-08-06',
  [OPENAI_MODELS.GPT4oMini]: 'gpt-4o-mini-2024-07-18',
} as const 