import { Category, type Action } from '@awell-health/extensions-core'
import { categorizeMessageWithLLM } from './lib/categorizeMessageWithLLM'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { markdownToHtml } from '@/utils'

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
    const {
      ChatModelGPT4oMini,
      fields: { categories, message },
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const categorization_result = await categorizeMessageWithLLM({
        ChatModelGPT4oMini,
        message,
        categories,
      })

      const category = categorization_result.category
      const explanationHtml = await markdownToHtml(
        categorization_result.explanation
      )
      console.log(category)
      console.log(explanationHtml)

      await onComplete({
        data_points: {
          category,
          explanation: explanationHtml,
        },
      })
    } catch (error) {
      console.error('Error categorizing message:', error)
      // Catch in extention server
      throw new Error('Error categorizing message')
    }
  },
}
