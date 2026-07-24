import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'

export const parseDateToUnixTimestamp: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'parseDateToUnixTimestamp',
  title: 'Parse date to unix timestamp',
  description: 'Transform or parse a date to a unix timestamp.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    try {
      const {
        fields: { date },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const dateObj = new Date(date)
      /**
       * The Math.floor function ensures that you're getting a whole number,
       * as Unix timestamps don't have millisecond precision.
       */
      const unixTimeStamp = Math.floor(dateObj.getTime() / 1000)

      helpers.log(
        { meta, date, unixTimeStamp },
        'Parsed date to unix timestamp',
      )

      await onComplete({
        data_points: {
          unixTimestamp: String(unixTimeStamp),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
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
