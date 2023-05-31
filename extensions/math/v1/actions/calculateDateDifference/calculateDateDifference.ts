import { type Action } from '@awell-health/extensions-core'
import { Category , validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from 'date-fns'
import { AssertionError } from 'node:assert'

export const calculateDateDifference: Action<typeof fields, typeof settings> = {
  key: 'calculateDateDifference',
  title: 'Calculate date difference',
  description:
    'Calculate the difference between 2 dates in a unit of your choice.',
  category: Category.MATH,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        fields: { dateLeft, dateRight, unit },
      } = validate({
        schema: z.object({ fields: FieldsValidationSchema }),
        payload,
      })

      const calculateDifference = (): number => {
        switch (unit) {
          case 'seconds': {
            return differenceInSeconds(dateLeft, dateRight)
          }
          case 'minutes': {
            return differenceInMinutes(dateLeft, dateRight)
          }
          case 'hours': {
            return differenceInHours(dateLeft, dateRight)
          }
          case 'days': {
            return differenceInDays(dateLeft, dateRight)
          }
          case 'weeks': {
            return differenceInWeeks(dateLeft, dateRight)
          }
          case 'months': {
            return differenceInMonths(dateLeft, dateRight)
          }
          case 'years': {
            return differenceInYears(dateLeft, dateRight)
          }
          default: {
            throw new AssertionError({
              message:
                "`unit` should be captured by validation. We shouldn't reach this error.",
            })
          }
        }
      }

      const dateDifference = calculateDifference()

      await onComplete({
        data_points: {
          dateDifference: String(dateDifference),
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
            text: { en: 'Something went wrong while orchestrating the action' },
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
