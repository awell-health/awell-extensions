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

export const demo: Webhook<keyof typeof dataPoints, Payload> = {
  key: 'demo',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess, onError) => {
    const { eventType, hello } = payload
    await onSuccess({
      data_points: {
        eventType,
        hello,
      },
    })
  },
}
