import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z } from 'zod'
import { parse, formatISO, parseISO, isValid } from 'date-fns'

export const combineDateAndTime: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'combineDateAndTime',
  title: 'Combine date and time',
  description:
    'Combine a reference date with a time string to create an ISO8601 datetime in UTC.',
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

    const {
      fields: { referenceDate, timeString },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    let combinedDate: Date

    const parsedTime = parse(timeString, 'HH:mm:ss', new Date())
    if (isValid(parsedTime)) {
      const baseDate = new Date(referenceDate)
      combinedDate = new Date(baseDate)
      combinedDate.setHours(parsedTime.getHours())
      combinedDate.setMinutes(parsedTime.getMinutes())
      combinedDate.setSeconds(parsedTime.getSeconds())
      combinedDate.setMilliseconds(0)
    } else {
      const parsedDateTime = parseISO(timeString)
      if (!isValid(parsedDateTime)) {
        helpers.log(
          { meta, referenceDate, timeString },
          'Invalid time string format',
        )
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Invalid time string format' },
              error: {
                category: 'WRONG_INPUT',
                message:
                  'Time string must be in ISO format HH:mm:ss (e.g., "14:30:00") or valid ISO8601 datetime with timezone (e.g., "2025-09-06T15:34:44+02:00")',
              },
            },
          ],
        })
        return
      }

      const baseDate = new Date(referenceDate)
      combinedDate = new Date(baseDate)
      combinedDate.setHours(parsedDateTime.getHours())
      combinedDate.setMinutes(parsedDateTime.getMinutes())
      combinedDate.setSeconds(parsedDateTime.getSeconds())
      combinedDate.setMilliseconds(0)
    }

    const isoDateTime = formatISO(combinedDate)

    helpers.log(
      { meta, referenceDate, timeString, combinedDateTime: isoDateTime },
      'Combined date and time',
    )

    await onComplete({
      data_points: {
        combinedDateTime: isoDateTime,
      },
    })
  },
}
