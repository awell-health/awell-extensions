import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  createdFormCompletionId: {
    key: 'createdFormCompletionId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const requestFormCompletionCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'requestFormCompletionCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: createdFormCompletionId } = payload

    if (isNil(createdFormCompletionId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    }

    await onSuccess({
      data_points: {
        createdFormCompletionId,
      },
    })
  },
}

export type RequestFormCompletionCreated = typeof requestFormCompletionCreated
