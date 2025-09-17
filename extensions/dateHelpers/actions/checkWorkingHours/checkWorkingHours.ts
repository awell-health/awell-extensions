import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { getHours, getMinutes, addDays, setHours, setMinutes } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
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
    'Check if the current time is within working hours and calculate minutes to next working hours as well as the datetime of the next working hours if not',
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
    let nextWorkingHoursDatetime: string | undefined

    // Calculate minutes to next working hours only if not currently within working hours
    if (!isWithinWorkingHours) {
      let nextWorkingHoursDate: Date

      if (currentTotalMinutes < startTotalMinutes) {
        // Before working hours today
        minutesToNextWorkingHours = startTotalMinutes - currentTotalMinutes
        // Set the datetime to today at working hours start time
        nextWorkingHoursDate = setMinutes(
          setHours(currentTimeInTimezone, startHour),
          startMinute,
        )
      } else {
        // After working hours today, so next working hours is tomorrow
        const minutesUntilMidnight = 24 * 60 - currentTotalMinutes
        minutesToNextWorkingHours = minutesUntilMidnight + startTotalMinutes
        // Set the datetime to tomorrow at working hours start time
        const tomorrow = addDays(currentTimeInTimezone, 1)
        nextWorkingHoursDate = setMinutes(
          setHours(tomorrow, startHour),
          startMinute,
        )
      }

      // Convert the zoned time back to UTC for consistent output
      const nextWorkingHoursUtc = zonedTimeToUtc(nextWorkingHoursDate, timezone)
      nextWorkingHoursDatetime = nextWorkingHoursUtc.toISOString()
    }

    await onComplete({
      data_points: {
        isWithinWorkingHours: String(isWithinWorkingHours),
        minutesToNextWorkingHours:
          minutesToNextWorkingHours !== undefined
            ? String(minutesToNextWorkingHours)
            : undefined,
        nextWorkingHoursDatetime,
      },
    })
  },
}
