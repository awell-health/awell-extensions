import { type DataPointDefinition, type Webhook } from '../../../lib/types'
import { isNil } from 'lodash'

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
  onWebhookReceived: async ({ payload, settings}, onSuccess, onError) => {
    const { resource_id } = payload
    if (isNil(resource_id)) {
      await onError({})
    } else {
      await onSuccess({
        data_points: {
          patientId: resource_id,
        },
      })
    }
  },
}
