import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const getNextDateOccurrence: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getNextDateOccurrence',
  title: 'Get next date occurrence',
  description: 'Get the next occurrence of a given date.',
  category: Category.WORKFLOW,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    const { referenceDate: referenceDateInput } = FieldsValidationSchema.parse(
      payload.fields,
    )

    const now = new Date()
    const referenceDate = referenceDateInput ?? now

    const targetMonth = referenceDate.getMonth() // 0–11
    const targetDay = referenceDate.getDate() // 1–31

    /**
     * Find the first occurrence of (targetMonth, targetDay)
     * that is strictly in the future compared to `afterDate`.
     */
    const findNextOccurrence = (afterDate: Date): Date => {
      let candidateYear = afterDate.getFullYear()

      // Loop until we get a valid candidate strictly > afterDate
      // and with the same month/day (handles Feb 29 properly).
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const candidate = new Date(
          candidateYear,
          targetMonth,
          targetDay,
          0,
          0,
          0,
          0,
        )

        const isSameMonthDay =
          candidate.getMonth() === targetMonth &&
          candidate.getDate() === targetDay

        if (isSameMonthDay && candidate.getTime() > afterDate.getTime()) {
          return candidate
        }

        candidateYear += 1
      }
    }

    // If the reference date is in the future, compare against it.
    // Otherwise, compare against "now".
    const anchorDate =
      referenceDate.getTime() > now.getTime() ? referenceDate : now

    const nextOccurrence = findNextOccurrence(anchorDate)

    await onComplete({
      data_points: {
        nextDateOccurrence: nextOccurrence.toISOString(),
      },
    })
  },
}
