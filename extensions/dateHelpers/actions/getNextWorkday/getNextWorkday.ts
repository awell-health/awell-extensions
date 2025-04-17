import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { dataPoints, fields } from './config'

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
    const SUNDAY = 0
    const SATURDAY = 6

    const today = new Date()

    // Normalize to start of day to avoid timezone issues
    today.setUTCHours(0, 0, 0, 0)

    // Advance to the next weekday if today is Saturday or Sunday
    while (today.getDay() === SUNDAY || today.getDay() === SATURDAY) {
      today.setDate(today.getDate() + 1)
    }

    const nextWorkday = today.toISOString()

    await onComplete({
      data_points: {
        nextWorkday,
      },
    })
  },
}
