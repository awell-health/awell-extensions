import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'

const dataPoints = {
  deletedMessageId: {
    key: 'deletedMessageId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const messageDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'messageDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: deletedMessageId } = payload

    if (isNil(deletedMessageId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          deletedMessageId,
        },
      })
    }
  },
}

export type MessageDeleted = typeof messageDeleted
