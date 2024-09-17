import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { categorizeMessageWithLLM } from './performCategorization'


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
  previewable: true, // TODO
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    console.log(payload)
    try {
      const { message, categories } = await FieldsValidationSchema.parseAsync(payload.fields)
      console.log(message)
      console.log(categories)
      const categorized_message = await categorizeMessageWithLLM(message, categories)
      console.log(categorized_message)

      await onComplete({
        data_points: {
          category: categorized_message,
        },
      })
    } catch (error) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: "Failed to categorize message" },
            error: {
              category: 'SERVER_ERROR', // todo improve later
              message: String(error),
            },
          },
        ],
      })
    }
  },
}