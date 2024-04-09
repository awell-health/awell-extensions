import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  updatedFormCompletionId: {
    key: 'updatedFormCompletionId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const requestFormCompletionUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'requestFormCompletionUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: updatedFormCompletionId } = payload

    if (isNil(updatedFormCompletionId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          updatedFormCompletionId,
        },
      })
    }
  },
}

export type RequestFormCompletionUpdated = typeof requestFormCompletionUpdated
