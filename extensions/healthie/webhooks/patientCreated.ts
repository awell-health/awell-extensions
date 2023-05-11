import { type DataPointDefinition, type Webhook } from '../../../lib/types'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

interface Payload {
  resource_id: string
  resource_id_type: string
  event_type: string
}

export const patientCreated: Webhook<keyof typeof dataPoints, Payload> = {
  key: 'patientCreated',
  dataPoints,
  onWebhookReceived: async ({ payload: { resource_id } }) => ({
    data_points: {
      patientId: resource_id,
    },
  }),
}
