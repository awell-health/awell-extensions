import { Category, type Action } from '@awell-health/extensions-core'
import { categorizeMessageWithLLM } from './lib/categorizeMessageWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '../../../../src/utils'

/**
 * Awell Action: Message Categorization
 * 
 * Takes a message and predefined categories as input, uses LLM to:
 * 1. Determine the most appropriate category
 * 2. Provide explanation for the categorization
 * 
 * @returns category and HTML-formatted explanation
 */
export const categorizeMessage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'categorizeMessage',
  category: Category.WORKFLOW,
  title: 'Categorize Message',
  description: 'Categorizes messages into predefined categories with explanation.',
  fields,
  previewable: false,
  dataPoints,

  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      // 1. Validate input fields
      const { message, categories } = FieldsValidationSchema.parse(payload.fields)

      // 2. Initialize OpenAI model with metadata
      const { model, metadata } = await createOpenAIModel({
        settings: payload.settings,
        helpers,
        payload,
        modelType: OPENAI_MODELS.GPT4oMini // task is simple and we don't need a more powerful model
      })

      // 3. Perform categorization
      const { category, explanation } = await categorizeMessageWithLLM({
        model,
        message,
        categories,
        metadata
      })

      // 4. Format and return results
      const explanationHtml = await markdownToHtml(explanation)
      await onComplete({
        data_points: { category, explanation: explanationHtml }
      })
    } catch (error) {
      console.error('Error in categorizeMessage action:', error)
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to categorize message'
      )
    }
  },
}
