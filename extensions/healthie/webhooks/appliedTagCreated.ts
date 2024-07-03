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
      createdAppliedTagId: data.resource_id,
    }
  })

const dataPoints = {
  createdAppliedTagId: {
    key: 'createdAppliedTagId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const appliedTagCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'appliedTagCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { createdAppliedTagId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.getAppliedTag({ id: createdAppliedTagId })
    const healthiePatientId = response?.data?.appliedTag?.user_id
    await onSuccess({
      data_points: {
        createdAppliedTagId,
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

export type AppliedTagCreated = typeof appliedTagCreated
