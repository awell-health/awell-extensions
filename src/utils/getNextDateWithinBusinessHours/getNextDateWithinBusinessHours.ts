import { startOfDay, addDays, setHours } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

const START_HOUR_WORKING_DAY = 9 // 9 AM
const END_HOUR_WORKING_DAY = 17 // 5 PM

export const isDateBetweenBusinessHours = (
  date: Date, // assuming all dates we receive are dates in UTC
  targetTimeZone: string = 'UTC'
): boolean => {
  const referenceDate = utcToZonedTime(date, targetTimeZone)
  const hoursOfDate = referenceDate.getHours()

  if (
    hoursOfDate >= START_HOUR_WORKING_DAY &&
    hoursOfDate < END_HOUR_WORKING_DAY
  ) {
    return true
  }

  return false
}

/**
 * Adjusts the given ISO date string to the next available time within business hours,
 * taking into account the specified time zone.
 *
 * @param date - The date to adjust.
 * @param targetTimeZone - The IANA time zone identifier string, such as "America/New_York".
 * @returns The next date between business hours in UTC
 */
export const getNextDateWithinBusinessHours = (
  date: Date, // assuming all dates we receive are dates in UTC
  targetTimeZone: string = 'UTC'
): Date => {
  // Convert date to the specified timezone
  const referenceDateInTimeZone = utcToZonedTime(date, targetTimeZone)
  const hours = referenceDateInTimeZone.getHours()

  // If before 9 AM in the specified timezone, adjust to 9 AM of the same day in that timezone, then convert back to UTC
  if (hours < START_HOUR_WORKING_DAY) {
    return zonedTimeToUtc(
      setHours(startOfDay(referenceDateInTimeZone), START_HOUR_WORKING_DAY),
      targetTimeZone
    )
  }
  // If after 5 PM in the specified timezone, adjust to 9 AM of the next day in that timezone, then convert back to UTC
  else if (hours >= END_HOUR_WORKING_DAY) {
    return zonedTimeToUtc(
      setHours(
        startOfDay(addDays(referenceDateInTimeZone, 1)),
        START_HOUR_WORKING_DAY
      ),
      targetTimeZone
    )
  }

  // If between 9 AM and 5 PM in the specified timezone, return the reference date itself, already in UTC
  return date
}
