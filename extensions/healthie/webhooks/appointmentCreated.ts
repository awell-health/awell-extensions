import { type DataPointDefinition, type Webhook } from '../../../lib/types'

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

interface Payload {
  resource_id: string
  resource_id_type: string
  event_type: string
}

export const appointmentCreated: Webhook<keyof typeof dataPoints, Payload> = {
  key: 'appointmentCreated',
  dataPoints,
  onWebhookReceived: async ({ payload: { resource_id } }) => ({
    data_points: {
      appointmentId: resource_id,
    },
  }),
}
