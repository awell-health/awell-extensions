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
        rescheduled,
      },
    } = payload

    if (rescheduled) {
      // https://api.calendly.com/scheduled_events/GBGBDCAADAEDCRZ2 => GBGBDCAADAEDCRZ2
      const scheduledEventId = scheduled_event.uri.split('/').pop()

      if (!isNil(scheduledEventId)) {
        await onSuccess({
          data_points: {
            eventId: scheduledEventId,
            inviteeEmail: email,
            inviteeFirstName: first_name,
            inviteeLastName: last_name,
            inviteeName: name,
            inviteeStatus: status,
            inviteeTimezone: timezone,
          },
        })
      }
    }
  },
}

export type EventRescheduled = typeof eventRescheduled
