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
  signedFormAnswerGroupId: {
    key: 'signedFormAnswerGroupId',
    valueType: 'string',
  },
  signedFormAnswerGroup: {
    key: 'signedFormAnswerGroup',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

const payloadSchema = z
  .object({
    resource_id: z.string(),
  })
  .transform((data) => {
    return {
      signedFormAnswerGroupId: data.resource_id,
    }
  })

export const formAnswerGroupSigned: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'formAnswerGroupSigned',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { signedFormAnswerGroupId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.getFormAnswerGroup({
      id: signedFormAnswerGroupId,
    })
    const healthiePatientId = response?.data?.formAnswerGroup?.user?.id
    await onSuccess({
      data_points: {
        signedFormAnswerGroupId,
        signedFormAnswerGroup: JSON.stringify(response?.data?.formAnswerGroup),
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

export type FormAnswerGroupSigned = typeof formAnswerGroupSigned
