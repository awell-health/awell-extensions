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
    const { referenceDate: referenceDateInput } = FieldsValidationSchema.parse(
      payload.fields,
    )

    const referenceDate = referenceDateInput ?? new Date()

    const SUNDAY = 0
    const SATURDAY = 6

    // Normalize to start of day to avoid timezone issues
    referenceDate.setUTCHours(0, 0, 0, 0)

    // Advance to the next weekday if today is Saturday or Sunday
    while (
      referenceDate.getDay() === SUNDAY ||
      referenceDate.getDay() === SATURDAY
    ) {
      referenceDate.setDate(referenceDate.getDate() + 1)
    }

    const nextWorkday = referenceDate.toISOString()

    await onComplete({
      data_points: {
        nextWorkday,
      },
    })
  },
}
