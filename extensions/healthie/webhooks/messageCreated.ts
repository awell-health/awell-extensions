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
      createdMessageId: data.resource_id,
    }
  })

const dataPoints = {
  createdMessageId: {
    key: 'createdMessageId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const messageCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'messageCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { createdMessageId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const messageResponse = await sdk.getMessage({ id: createdMessageId })
    const conversationResponse = await sdk.getConversation({ id: messageResponse?.data?.note?.conversation_id })
    const healthiePatientId = conversationResponse?.data?.conversation?.patient_id
    await onSuccess({
      data_points: {
        createdMessageId,
      },
      ...(!isNil(healthiePatientId) && {
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: healthiePatientId,
        }
      })
    })
  },
}

export type MessageCreated = typeof messageCreated
