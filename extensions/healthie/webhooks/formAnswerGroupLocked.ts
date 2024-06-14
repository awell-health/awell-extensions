import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'
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
    await onSuccess({
      data_points: {
        lockedFormAnswerGroupId,
        lockedFormAnswerGroup: JSON.stringify(response?.data?.formAnswerGroup),
      },
    })
  },
}

export type FormAnswerGroupLocked = typeof formAnswerGroupLocked
