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
      deletedAppliedTagId: data.resource_id,
    }
  })

const dataPoints = {
  deletedAppliedTagId: {
    key: 'deletedAppliedTagId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const appliedTagDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'appliedTagDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { deletedAppliedTagId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.GetAppliedTag({ id: deletedAppliedTagId, include_deleted: true})
    const healthiePatientId = response?.data?.appliedTag?.user_id
    await onSuccess({
      data_points: {
        deletedAppliedTagId,
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

export type AppliedTagDeleted = typeof appliedTagDeleted
