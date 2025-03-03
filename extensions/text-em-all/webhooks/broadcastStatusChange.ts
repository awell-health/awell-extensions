import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type BroadcastStatusNotification } from './types'

const dataPoints = {
  broadcastId: {
    key: 'broadcastId',
    valueType: 'number',
  },
  broadcastStatus: {
    key: 'broadcastStatus',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const broadcastStatusChange: Webhook<
  keyof typeof dataPoints,
  BroadcastStatusNotification
> = {
  key: 'broadcastStatusChange',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess, onError) => {
    const { notification, payload: broadcastStatusNotification } = payload

    const skippedStatuses = ['created', 'ready', 'paused', 'resumed']
    if (skippedStatuses.includes(broadcastStatusNotification.broadcastStatus)) {
      return
    }

    // only accept broadcast-status-change events
    if (notification.eventType !== 'broadcast-status-change') {
      await onError({
        response: {
          statusCode: 400,
          message: 'eventType must be broadcast-status-change',
        },
      })
    } else {
      await onSuccess({
        data_points: {
          broadcastId: String(broadcastStatusNotification.broadcastID),
          broadcastStatus: broadcastStatusNotification.broadcastStatus,
        },
      })
    }
  },
}

export type OnbroadcastStatusChange = typeof broadcastStatusChange
