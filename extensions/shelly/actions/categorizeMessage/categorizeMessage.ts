import { Category, type Action } from '@awell-health/extensions-core'
import { categorizeMessageWithLLM } from './lib/categorizeMessageWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '../../../../src/utils'

export const categorizeMessage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'categorizeMessage',
  category: Category.WORKFLOW,
  title: 'Categorize Message',
  description:
    'Categorize the input message into set of predefined categories and provides explanation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      const { message, categories } = FieldsValidationSchema.parse(payload.fields)

      const { model, metadata } = await createOpenAIModel({
        settings: payload.settings,
        helpers,
        payload,
        modelType: OPENAI_MODELS.GPT4oMini
      })

      const categorization_result = await categorizeMessageWithLLM({
        model,
        message,
        categories,
        metadata
      })

      const explanationHtml = await markdownToHtml(
        categorization_result.explanation
      )

      await onComplete({
        data_points: {
          category: categorization_result.category,
          explanation: explanationHtml,
        },
      })
    } catch (error) {
      console.error('Error categorizing message:', error)
      throw new Error('Error categorizing message')
    }
  },
}
