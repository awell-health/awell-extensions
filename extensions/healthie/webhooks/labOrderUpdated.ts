import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import z from 'zod'
import { validateWebhookPayloadAndCreateSdk } from '../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../settings'

const payloadSchema = z
  .object({
    resource_id: z.string(),
  })
  .transform((data) => {
    return {
      updatedLabOrderId: data.resource_id,
    }
  })
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
    const {
      validatedPayload: { updatedLabOrderId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.GetLabOrder({ id: updatedLabOrderId })
    const healthiePatientId = response?.data?.labOrder?.patient.id
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
  },
}

export type LabOrderUpdated = typeof labOrderUpdated
