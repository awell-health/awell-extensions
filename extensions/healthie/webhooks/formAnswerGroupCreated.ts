import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'
import z from 'zod'
import { validateWebhookPayloadAndCreateSdk } from '../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../settings'

const dataPoints = {
  createdFormAnswerGroupId: {
    key: 'createdFormAnswerGroupId',
    valueType: 'string',
  },
  createdFormAnswerGroup: {
    key: 'createdFormAnswerGroup',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

const payloadSchema = z
  .object({
    resource_id: z.string(),
  })
  .transform((data) => {
    return {
      createdFormAnswerGroupId: data.resource_id,
    }
  })

export const formAnswerGroupCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'formAnswerGroupCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { createdFormAnswerGroupId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const response = await sdk.getFormAnswerGroup({
      id: createdFormAnswerGroupId,
    })
    await onSuccess({
      data_points: {
        createdFormAnswerGroupId,
        createdFormAnswerGroup: JSON.stringify(response?.data?.formAnswerGroup),
      },
    })
  },
}

export type FormAnswerGroupCreated = typeof formAnswerGroupCreated
