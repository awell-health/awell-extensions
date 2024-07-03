import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import z from 'zod'
import { validateWebhookPayloadAndCreateSdk } from '../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../settings'

const dataPoints = {
  deletedFormAnswerGroupId: {
    key: 'deletedFormAnswerGroupId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

const payloadSchema = z
  .object({
    resource_id: z.string(),
  })
  .transform((data) => {
    return {
      deletedFormAnswerGroupId: data.resource_id,
    }
  })

export const formAnswerGroupDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'formAnswerGroupDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { deletedFormAnswerGroupId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.getFormAnswerGroup({
      id: deletedFormAnswerGroupId,
    })
    const healthiePatientId = response?.data?.formAnswerGroup?.user?.id
    await onSuccess({
      data_points: {
        deletedFormAnswerGroupId,
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

export type FormAnswerGroupDeleted = typeof formAnswerGroupDeleted
