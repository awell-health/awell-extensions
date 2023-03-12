import { type DataPointDefinition, type Webhook } from '../../../lib/types'

const dataPoints = {
  eventType: {
    key: 'eventType',
    valueType: 'string',
  },
  hello: {
    key: 'webhookDataPoint',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

interface Payload {
  eventType: string
  hello: string
}

export const test: Webhook<keyof typeof dataPoints, Payload> = {
  key: 'test',
  dataPoints,
  onWebhookReceived: async (payload) => payload,
}
