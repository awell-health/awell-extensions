import { isNil } from 'lodash'
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
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: patientId } = payload
    if (isNil(patientId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      if (patientId === 'test') {
        await onError({
          response: {
            statusCode: 206,
            message: 'test accepted',
          },
        })
      }
      await onSuccess({
        data_points: {
          patientId,
        },
      })
    }
  },
}
