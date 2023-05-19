import { isNil } from 'lodash'
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
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: appointmentId } = payload
    if (isNil(appointmentId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      if (appointmentId === 'test') {
        await onError({
          response: {
            statusCode: 206,
            message: 'test accepted',
          },
        })
      }
      await onSuccess({
        data_points: {
          appointmentId,
        },
      })
    }
  },
}
