import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { formatErrors } from '../lib/sdk/errors'
import { createSdk } from '../lib/sdk/createSdk'
  
const dataPoints = {
  createdMetricId: {
    key: 'createdMetricId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const metricEntryCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'metricEntryCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({ settings })
      const createdMetricId = payload.resource_id.toString()
  
      const response = await sdk.getMetricEntry({ id: createdMetricId })
      const healthiePatientId = response?.data?.entry?.poster?.id
      await onSuccess({
        data_points: {
          createdMetricId,
        },
        ...(!isNil(healthiePatientId) && {
          patient_identifier: {
            system: HEALTHIE_IDENTIFIER,
            value: healthiePatientId,
          },
        }),
      })
    } catch (error) {
      const formattedError = formatErrors(error)
      await onError(formattedError)
    }
  },
}

export type MetricEntryCreated = typeof metricEntryCreated
