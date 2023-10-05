import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'

export const parseUnixTimestampToDate: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'parseUnixTimestampToDate',
  title: 'Parse unix timestamp to date',
  description: 'Transform or parse a unix timestamp to a date.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { unixTimeStamp },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const isoDate = new Date(unixTimeStamp * 1000).toISOString()

      await onComplete({
        data_points: {
          date: String(isoDate),
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
