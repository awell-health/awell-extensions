import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { createSdk } from '../lib/sdk/graphql-codegen/createSdk'
import { formatError } from '../lib/sdk/graphql-codegen/errors'
import { webhookPayloadSchema } from '../lib/helpers'

const dataPoints = {
  updatedMetricId: {
    key: 'updatedMetricId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const metricEntryUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'metricEntryUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({ settings })

      const validatedPayload = webhookPayloadSchema.parse(payload)
      const updatedMetricId = validatedPayload.resource_id.toString()

      const response = await sdk.getMetricEntry({ id: updatedMetricId })
      const healthiePatientId = response?.data?.entry?.poster?.id

      await onSuccess({
        data_points: {
          updatedMetricId,
        },
        ...(!isNil(healthiePatientId) && {
          patient_identifier: {
            system: HEALTHIE_IDENTIFIER,
            value: healthiePatientId,
          },
        }),
      })
    } catch (error) {
      await onError(formatError(error))
    }
  },
}

export type MetricEntryUpdated = typeof metricEntryUpdated
