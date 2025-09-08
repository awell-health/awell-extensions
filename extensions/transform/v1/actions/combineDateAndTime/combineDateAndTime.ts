import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { parse, formatISO } from 'date-fns'

export const combineDateAndTime: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'combineDateAndTime',
  title: 'Combine date and time',
  description: 'Combine a reference date with a time string to create an ISO8601 datetime.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { referenceDate, timeString },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const baseDate = new Date(referenceDate)
      
      const timeDate = parse(timeString, 'HH:mm:ss', new Date())
      
      const combinedDate = new Date(baseDate)
      combinedDate.setHours(timeDate.getHours())
      combinedDate.setMinutes(timeDate.getMinutes())
      combinedDate.setSeconds(timeDate.getSeconds())
      combinedDate.setMilliseconds(0)

      const isoDateTime = formatISO(combinedDate)

      await onComplete({
        data_points: {
          combinedDateTime: isoDateTime,
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
