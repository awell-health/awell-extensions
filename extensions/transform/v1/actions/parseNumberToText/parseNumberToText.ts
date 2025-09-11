import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'

export const parseNumberToText: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'parseNumberToText',
  title: 'Parse number to text',
  description: 'Transform or parse number to text (string).',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    try {
      const {
        fields: { number },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      await onComplete({
        data_points: {
          text: String(number),
        },
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
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
