import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  createdAppliedTagId: {
    key: 'createdAppliedTagId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const appliedTagCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'appliedTagCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: createdAppliedTagId } = payload

    if (isNil(createdAppliedTagId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          createdAppliedTagId,
        },
      })
    }
  },
}

export type AppliedTagCreated = typeof appliedTagCreated
