import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getHours, getMinutes } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const checkWorkingHours: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkWorkingHours',
  title: 'Check Working Hours',
  description:
    'Check if the current time is within working hours and calculate minutes to next working hours if not',
  category: Category.WORKFLOW,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    const { workingHoursStart, workingHoursEnd, timezone } =
      FieldsValidationSchema.parse(payload.fields)

    // Get current UTC time
    const now = new Date()

    // Convert current UTC time to the specified timezone
    const currentTimeInTimezone = utcToZonedTime(now, timezone)

    // Parse working hours
    const [startHour, startMinute] = workingHoursStart.split(':').map(Number)
    const [endHour, endMinute] = workingHoursEnd.split(':').map(Number)

    // Validate that end time is after start time
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    if (endTotalMinutes <= startTotalMinutes) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: 'Working hours end time must be after start time. Cross-midnight hours are not supported.',
            },
            error: {
              category: 'BAD_REQUEST',
              message: 'Working hours end time must be after start time',
            },
          },
        ],
      })
      return
    }

    // Get current time in minutes since midnight using date-fns
    const currentHour = getHours(currentTimeInTimezone)
    const currentMinute = getMinutes(currentTimeInTimezone)
    const currentTotalMinutes = currentHour * 60 + currentMinute

    // Check if within working hours
    const isWithinWorkingHours =
      currentTotalMinutes >= startTotalMinutes &&
      currentTotalMinutes < endTotalMinutes

    let minutesToNextWorkingHours: number | undefined

    // Calculate minutes to next working hours only if not currently within working hours
    if (!isWithinWorkingHours) {
      if (currentTotalMinutes < startTotalMinutes) {
        // Before working hours today
        minutesToNextWorkingHours = startTotalMinutes - currentTotalMinutes
      } else {
        // After working hours today, so next working hours is tomorrow
        const minutesUntilMidnight = 24 * 60 - currentTotalMinutes
        minutesToNextWorkingHours = minutesUntilMidnight + startTotalMinutes
      }
    }

    await onComplete({
      data_points: {
        isWithinWorkingHours: String(isWithinWorkingHours),
        minutesToNextWorkingHours:
          minutesToNextWorkingHours !== undefined
            ? String(minutesToNextWorkingHours)
            : undefined,
      },
    })
  },
}
