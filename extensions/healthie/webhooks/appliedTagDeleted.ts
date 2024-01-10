import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  deletedAppliedTagId: {
    key: 'deletedAppliedTagId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const appliedTagDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'appliedTagDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: deletedAppliedTagId } = payload

    if (isNil(deletedAppliedTagId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          deletedAppliedTagId,
        },
      })
    }
  },
}

export type AppliedTagDeleted = typeof appliedTagDeleted
