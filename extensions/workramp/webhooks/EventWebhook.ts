import {
  DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { WORKRAMP_IDENTIFIER } from '../config'
import { settings } from '../settings'
import { EventPayload, EventPayloadSchema } from '../types'

const dataPoints = {
  eventType: {
    key: 'eventType',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const eventWebhook: Webhook<
  keyof typeof dataPoints,
  EventPayload,
  typeof settings
> = {
  key: 'eventWebhook',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess, onError) => {
    const {
      user: { id: value },
      eventType,
    } = EventPayloadSchema.parse(payload)
    await onSuccess({
      data_points: {
        eventType: eventType.toString(),
      },
      patient_identifier: {
        system: WORKRAMP_IDENTIFIER,
        value,
      },
    })
  },
}

export type EventWebhook = typeof eventWebhook
