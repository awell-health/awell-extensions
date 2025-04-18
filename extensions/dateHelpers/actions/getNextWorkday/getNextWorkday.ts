import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const getNextWorkday: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getNextWorkday',
  title: 'Get Next Workday',
  description: 'Get the next workday',
  category: Category.WORKFLOW,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    const { referenceDate: referenceDateInput, includeReferenceDate } =
      FieldsValidationSchema.parse(payload.fields)

    const referenceDate = referenceDateInput ?? new Date()

    // Normalize to start of day to avoid timezone issues
    referenceDate.setUTCHours(0, 0, 0, 0)

    const SUNDAY = 0
    const SATURDAY = 6
    const isWeekend = (date: Date): boolean =>
      date.getDay() === SUNDAY || date.getDay() === SATURDAY
    const referenceDateIsWeekday = !isWeekend(referenceDate)

    // If reference date is a weekday and we should *not* include it, move forward by one day
    if (!includeReferenceDate && !isWeekend(referenceDate)) {
      referenceDate.setDate(referenceDate.getDate() + 1)
    }

    // If resultDate is a weekend, keep moving forward to the next weekday
    while (isWeekend(referenceDate)) {
      referenceDate.setDate(referenceDate.getDate() + 1)
    }

    const nextWorkday = referenceDate.toISOString()

    await onComplete({
      data_points: {
        nextWorkday,
        referenceDateIsWeekday: String(referenceDateIsWeekday),
      },
    })
  },
}
