import { type ActivityEvent } from '@awell-health/extensions-core'

/**
 * Adjusts the given ISO date string to the next available time within business hours,
 * taking into account the specified time zone.
 *
 * @param message - The message of the event log
 * @param date - The date of the event log. If none provided, the current date is used
 * @returns ActivityEvent
 */
export const addActivityEventLog = ({
  date,
  message,
}: {
  date?: Date
  message: string
}): ActivityEvent => {
  const eventDate = date ?? new Date()

  return {
    date: eventDate.toISOString(),
    text: {
      en: message,
    },
  }
}
