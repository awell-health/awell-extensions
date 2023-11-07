import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type CalendlyWebhookPayload } from '../types'

const dataPoints = {
  eventId: {
    key: 'eventId',
    valueType: 'string',
  },
  eventTypeId: {
    key: 'eventTypeId',
    valueType: 'string',
  },
  inviteeEmail: {
    key: 'inviteeEmail',
    valueType: 'string',
  },
  inviteeFirstName: {
    key: 'inviteeFirstName',
    valueType: 'string',
  },
  inviteeLastName: {
    key: 'inviteeLastName',
    valueType: 'string',
  },
  inviteeName: {
    key: 'inviteeName',
    valueType: 'string',
  },
  inviteeStatus: {
    key: 'inviteeStatus',
    valueType: 'string',
  },
  inviteeTimezone: {
    key: 'inviteeTimezone',
    valueType: 'string',
  },
  hostEmail: {
    key: 'hostEmail',
    valueType: 'string',
  },
  startTime: {
    key: 'startTime',
    valueType: 'date',
  },
  endTime: {
    key: 'endTime',
    valueType: 'date',
  },
  cancelUrl: {
    key: 'cancelUrl',
    valueType: 'string',
  },
  rescheduleUrl: {
    key: 'rescheduleUrl',
    valueType: 'string',
  },
  videoCallUrl: {
    key: 'videoCallUrl',
    valueType: 'string',
  },
  eventName: {
    key: 'eventName',
    valueType: 'string',
  },
  inviteePhoneNumber: {
    key: 'inviteePhoneNumber',
    valueType: 'string',
  }
} satisfies Record<string, DataPointDefinition>

export const eventRescheduled: Webhook<
  keyof typeof dataPoints,
  CalendlyWebhookPayload
> = {
  key: 'eventRescheduled',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess, onError) => {
    const {
      payload: {
        email,
        first_name,
        last_name,
        name,
        scheduled_event,
        status,
        timezone,
        cancel_url,
        reschedule_url,
        rescheduled,
      },
    } = payload

    if (rescheduled) {
      // https://api.calendly.com/scheduled_events/GBGBDCAADAEDCRZ2 => GBGBDCAADAEDCRZ2
      const scheduledEventId = scheduled_event.uri.split('/').pop()

      const scheduledEventTypeId = scheduled_event.event_type.split('/').pop()

      const hostEmail =
        scheduled_event.event_memberships.length > 0
          ? scheduled_event.event_memberships[0].user_email
          : ''

      if (
        !isNil(scheduledEventId) &&
        !isNil(scheduledEventTypeId) &&
        rescheduled
      ) {
        await onSuccess({
          data_points: {
            eventId: scheduledEventId,
            eventTypeId: scheduledEventTypeId,
            inviteeEmail: email,
            inviteeFirstName: first_name,
            inviteeLastName: last_name,
            inviteeName: name,
            inviteeStatus: status,
            inviteeTimezone: timezone,
            startTime: scheduled_event.start_time,
            endTime: scheduled_event.end_time,
            cancelUrl: cancel_url,
            rescheduleUrl: reschedule_url,
            hostEmail,
            videoCallUrl: scheduled_event.location.join_url ?? "",
            inviteePhoneNumber: scheduled_event.text_reminder_number ?? "",
            eventName: scheduled_event.name
          },
        })
      }
    }
  },
}

export type EventRescheduled = typeof eventRescheduled
