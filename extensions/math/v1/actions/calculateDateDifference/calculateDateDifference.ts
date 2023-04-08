import { type Action, type NewActivityPayload } from '../../../../../lib/types'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { fields, dataPoints } from './config'
import { validateDataPoints } from './config/dataPoints'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
} from 'date-fns'

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
      const { dateLeft, dateRight, unit } = validateActionFields(payload.fields)

      const calculateDifference = (): number => {
        if (unit === 'seconds') {
          return differenceInSeconds(dateLeft, dateRight)
        }

        if (unit === 'minutes') {
          return differenceInMinutes(dateLeft, dateRight)
        }

        if (unit === 'hours') {
          return differenceInHours(dateLeft, dateRight)
        }

        if (unit === 'days') {
          return differenceInDays(dateLeft, dateRight)
        }

        if (unit === 'weeks') {
          return differenceInWeeks(dateLeft, dateRight)
        }

        if (unit === 'months') {
          return differenceInMonths(dateLeft, dateRight)
        }

        if (unit === 'years') {
          return differenceInYears(dateLeft, dateRight)
        }

        return 0
      }

      const dateDifference = calculateDifference()

      const { dateDifference: validatedDateDifference } = validateDataPoints({
        dateDifference,
      })

      await onComplete({
        data_points: {
          dateDifference: String(validatedDateDifference),
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

export type DateDifferenceActivityPayload = NewActivityPayload<
  keyof typeof settings,
  keyof typeof fields
>
