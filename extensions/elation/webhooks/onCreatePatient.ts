import { type DataPointDefinition, type Webhook } from '../../../lib/types'
import { type SubscriptionEvent } from '../types/subscription'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const onCreatePatient: Webhook<
  keyof typeof dataPoints,
  SubscriptionEvent
> = {
  key: 'onCreatePatient',
  dataPoints,
  onWebhookReceived: async ({ payload: { data } }) => {
    return {
      data_points: { patientId: String(data.id) },
    }
  },
}
