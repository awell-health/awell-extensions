import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'

const dataPoints = {
  createdMessageId: {
    key: 'createdMessageId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const messageCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'messageCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: createdMessageId } = payload

    if (isNil(createdMessageId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          createdMessageId,
        },
      })
    }
  },
}

export type MessageCreated = typeof messageCreated
