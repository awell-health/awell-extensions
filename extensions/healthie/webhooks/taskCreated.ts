import { isNil } from 'lodash'
import { type DataPointDefinition, type Webhook } from '../../../lib/types'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  createdTaskId: {
    key: 'createdTaskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const taskCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'taskCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: createdTaskId } = payload

    if (isNil(createdTaskId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    }

    await onSuccess({
      data_points: {
        createdTaskId,
      },
    })
  },
}

export type TaskCreated = typeof taskCreated
