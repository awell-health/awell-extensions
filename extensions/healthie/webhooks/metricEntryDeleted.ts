import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'

const dataPoints = {
  deletedMetricId: {
    key: 'deletedMetricId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const metricEntryDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'metricEntryDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: deletedMetricId } = payload

    if (isNil(deletedMetricId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          deletedMetricId,
        },
      })
    }
  },
}

export type MetricEntryDeleted = typeof metricEntryDeleted
