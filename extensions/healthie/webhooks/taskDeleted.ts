import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  deletedTaskId: {
    key: 'deletedTaskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const taskDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'taskDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: deletedTaskId } = payload

    if (isNil(deletedTaskId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          deletedTaskId,
        },
      })
    }
  },
}

export type TaskDeleted = typeof taskDeleted
