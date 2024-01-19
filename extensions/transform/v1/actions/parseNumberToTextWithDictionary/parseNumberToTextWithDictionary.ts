import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'

export const parseNumberToTextWithDictionary: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'parseNumberToTextWithDictionary',
  title: 'Parse number to text with dictionary',
  description: 'Transform or parse a number to text based on a dictionary.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { number, dictionary },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const getStringFromDictionary = (): string => {
        const key = number.toString()

        /**
         * Get string value from the dict.
         * If no mapping is found in dict, return the number as a string
         */
        const output = Object.prototype.hasOwnProperty.call(dictionary, key)
          ? dictionary[key]
          : key

        return String(output)
      }

      await onComplete({
        data_points: {
          text: getStringFromDictionary(),
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: {
                category: 'WRONG_INPUT',
                message: `${error.message}`,
              },
            },
          ],
        })
        return
      }

      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
