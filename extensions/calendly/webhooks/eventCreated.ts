/* eslint-disable @typescript-eslint/naming-convention */
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type CalendlyWebhookPayload } from '../types'
import { activeSchema } from '../schema'
import {
  extractHostEmail,
  extractScheduledEventId,
  extractScheduledEventTypeId,
} from '../helpers'

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
  },
  rescheduled: {
    key: 'rescheduled',
    valueType: 'boolean',
  },
  is_rescheduled_event: {
    key: 'is_rescheduled_event',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const eventCreated: Webhook<
  keyof typeof dataPoints,
  CalendlyWebhookPayload
> = {
  key: 'eventCreated',
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
        old_invitee,
        rescheduled,
        text_reminder_number,
      },
    } = activeSchema.parse(payload)

    const scheduledEventId = extractScheduledEventId(scheduled_event)
    const scheduledEventTypeId = extractScheduledEventTypeId(scheduled_event)
    const hostEmail = extractHostEmail(scheduled_event)

    await onSuccess({
      data_points: {
        eventId: scheduledEventId,
        eventTypeId: scheduledEventTypeId,
        inviteeEmail: email,
        inviteeFirstName: first_name ?? '',
        inviteeLastName: last_name ?? '',
        inviteeName: name,
        inviteeStatus: status,
        inviteeTimezone: timezone,
        startTime: scheduled_event.start_time,
        endTime: scheduled_event.end_time,
        cancelUrl: cancel_url,
        rescheduleUrl: reschedule_url,
        hostEmail,
        videoCallUrl: scheduled_event.location.join_url ?? '',
        inviteePhoneNumber: text_reminder_number ?? '',
        eventName: scheduled_event.name,
        rescheduled: String(rescheduled),
        is_rescheduled_event: String(old_invitee !== null),
      },
    })
  },
}

export type EventCreated = typeof eventCreated
