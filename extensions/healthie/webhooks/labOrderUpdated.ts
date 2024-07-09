import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { formatError } from '../lib/sdk/errors'
import { createSdk } from '../lib/sdk/createSdk'
import { webhookPayloadSchema } from '../lib/helpers'
  
const dataPoints = {
  updatedLabOrderId: {
    key: 'updatedLabOrderId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const labOrderUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'labOrderUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({ settings })

      const validatedPayload = webhookPayloadSchema.parse(payload)
      const updatedLabOrderId = validatedPayload.resource_id.toString()

      const response = await sdk.getLabOrder({ id: updatedLabOrderId })
      const healthiePatientId = response?.data?.labOrder?.patient?.id
      await onSuccess({
        data_points: {
           updatedLabOrderId,
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

export type LabOrderUpdated = typeof labOrderUpdated
