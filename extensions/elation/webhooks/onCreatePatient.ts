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
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { data, resource } = payload
    if (resource !== 'patients') {
      await onError({
        response: {
          statusCode: 400,
          message: 'resource must be patients',
        },
      })
    } else {
      await onSuccess({
        data_points: { patientId: String(data.id) },
      })
    }
  },
}
