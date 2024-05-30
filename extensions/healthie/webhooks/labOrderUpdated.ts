import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'

const dataPoints = {
  updatedLabOrderId: {
    key: 'updatedLabOrderId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const labOrderUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'labOrderUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: updatedLabOrderId } = payload

    if (isNil(updatedLabOrderId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          updatedLabOrderId,
        },
      })
    }
  },
}

export type LabOrderUpdated = typeof labOrderUpdated
