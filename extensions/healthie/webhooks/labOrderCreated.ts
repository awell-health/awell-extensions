import { isNil } from 'lodash'
import { type DataPointDefinition, type Webhook } from '../../../lib/types'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  createdLabOrderId: {
    key: 'createdLabOrderId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const labOrderCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'labOrderCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: createdLabOrderId } = payload

    if (isNil(createdLabOrderId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    }

    await onSuccess({
      data_points: {
        createdLabOrderId,
      },
    })
  },
}

export type LabOrderCreated = typeof labOrderCreated
