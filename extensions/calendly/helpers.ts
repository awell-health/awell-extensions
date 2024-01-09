/* eslint-disable @typescript-eslint/naming-convention */
import { isNil } from 'lodash'

/**
 * https://api.calendly.com/scheduled_events/GBGBDCAADAEDCRZ2 => GBGBDCAADAEDCRZ2
 * @param param0
 * @returns
 */
export const extractScheduledEventId = ({ uri }: { uri: string }): string => {
  const scheduledEventId = /scheduled_events\/(.+)/.exec(uri)?.[1]

  if (isNil(scheduledEventId)) {
    throw new Error(`Could not parse scheduled event id from uri ${uri}`)
  }
  return scheduledEventId
}

/**
 * https://api.calendly.com/event_types/GBGBDCAADAEDCRZ2 => GBGBDCAADAEDCRZ2
 * @param param0
 * @returns
 */
export const extractScheduledEventTypeId = ({
  event_type,
}: {
  event_type: string
}): string => {
  const scheduledEventTypeId = /event_types\/(.+)/.exec(event_type)?.[1]

  if (isNil(scheduledEventTypeId)) {
    throw new Error(
      `Could not parse scheduled event type id from uri ${event_type}`
    )
  }
  return scheduledEventTypeId
}

export const extractHostEmail = ({
  event_memberships,
}: {
  event_memberships: Array<{ user_email: string }>
}): string => {
  return event_memberships.length > 0 ? event_memberships[0].user_email : ''
}
