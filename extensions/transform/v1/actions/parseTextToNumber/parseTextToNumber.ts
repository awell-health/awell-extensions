import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'

export const parseTextToNumber: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'parseTextToNumber',
  title: 'Parse text to number',
  description:
    'Transform or parse text (string) to a number. Will return NaN if the input data is not a number.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { text },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const parsed = parseFloat(text)
      const output = isNaN(parsed) ? NaN : parsed

      await onComplete({
        data_points: {
          number: String(output),
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
