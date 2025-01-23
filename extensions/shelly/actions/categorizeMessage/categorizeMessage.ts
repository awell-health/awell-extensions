import { Category, type Action } from '@awell-health/extensions-core'
import { categorizeMessageWithLLM } from './lib/categorizeMessageWithLLM'
import { validatePayloadAndCreateSdk } from '../../lib'
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
    const {
      ChatModelGPT4oMini,
      fields: { categories, message },
      pathway,
      activity,
    } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const metadata = {
        care_flow_definition_id: pathway.definition_id,
        care_flow_id: pathway.id,
        activity_id: activity.id,
      }

      const categorization_result = await categorizeMessageWithLLM({
        ChatModelGPT4oMini,
        message,
        categories,
        metadata,
      })

      const category = categorization_result.category
      const explanationHtml = await markdownToHtml(
        categorization_result.explanation
      )

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
