import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'

const dataPoints = {
  deletedFormCompletionId: {
    key: 'deletedFormCompletionId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const requestFormCompletionDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'requestFormCompletionDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: deletedFormCompletionId } = payload

    if (isNil(deletedFormCompletionId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          deletedFormCompletionId,
        },
      })
    }
  },
}

export type RequestFormCompletionDeleted = typeof requestFormCompletionDeleted
