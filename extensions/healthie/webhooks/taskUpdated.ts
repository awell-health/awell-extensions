import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  updatedTaskId: {
    key: 'updatedTaskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const taskUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'taskUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: updatedTaskId } = payload

    if (isNil(updatedTaskId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    }

    await onSuccess({
      data_points: {
        updatedTaskId,
      },
    })
  },
}

export type TaskUpdated = typeof taskUpdated
