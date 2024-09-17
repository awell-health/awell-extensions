import { Category, type Action } from '@awell-health/extensions-core'
import { categorizeMessageWithLLM } from './lib/categorizeMessageWithLLM'
import { validatePayloadAndCreateSdk } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const categorizeMessage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'categorizeMessage',
  category: Category.WORKFLOW,
  title: 'Categorize Message',
  description: 'Categorize the input message into set of predefined categories',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      langChainOpenAiSdk,
      fields: { categories, message },
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const category = await categorizeMessageWithLLM({
        langChainOpenAiSdk,
        message,
        categories,
      })

      await onComplete({
        data_points: {
          category,
        },
      })
    } catch (error) {
      console.error('Error categorizing message:', error)
      // Catch in extention server
      throw new Error('Error categorizing message')
    }
  },
}
