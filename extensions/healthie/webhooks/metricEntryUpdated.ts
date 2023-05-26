import { isNil } from 'lodash'
import { type DataPointDefinition, type Webhook } from '../../../lib/types'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  updatedMetricId: {
    key: 'updatedMetricId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const metricEntryUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'metricEntryUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: updatedMetricId } = payload

    if (isNil(updatedMetricId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    }

    await onSuccess({
      data_points: {
        updatedMetricId,
      },
    })
  },
}

export type MetricEntryUpdated = typeof metricEntryUpdated
