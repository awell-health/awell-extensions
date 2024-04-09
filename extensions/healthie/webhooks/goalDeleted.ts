import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  deletedGoalId: {
    key: 'deletedGoalId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const goalDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'goalDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: deletedGoalId } = payload

    if (isNil(deletedGoalId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          deletedGoalId,
        },
      })
    }
  },
}

export type GoalDeleted = typeof goalDeleted
