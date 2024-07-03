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
      updatedTaskId: data.resource_id,
    }
  })

const dataPoints = {
  updatedTaskId: {
    key: 'updatedTaskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const taskUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'taskUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { updatedTaskId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.GetTask({ id: updatedTaskId })
    const healthiePatientId = response?.data?.task?.client_id
    await onSuccess({
      data_points: {
        updatedTaskId,
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

export type TaskUpdated = typeof taskUpdated
