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
  lockedFormAnswerGroupId: {
    key: 'lockedFormAnswerGroupId',
    valueType: 'string',
  },
  lockedFormAnswerGroup: {
    key: 'lockedFormAnswerGroup',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

const payloadSchema = z
  .object({
    resource_id: z.string(),
  })
  .transform((data) => {
    return {
      lockedFormAnswerGroupId: data.resource_id,
    }
  })

export const formAnswerGroupLocked: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'formAnswerGroupLocked',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { lockedFormAnswerGroupId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.getFormAnswerGroup({
      id: lockedFormAnswerGroupId,
    })
    const healthiePatientId = response?.data?.formAnswerGroup?.user?.id
    await onSuccess({
      data_points: {
        lockedFormAnswerGroupId,
        lockedFormAnswerGroup: JSON.stringify(response?.data?.formAnswerGroup),
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

export type FormAnswerGroupLocked = typeof formAnswerGroupLocked
