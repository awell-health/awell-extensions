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
      deletedMessageId: data.resource_id,
    }
  })

const dataPoints = {
  deletedMessageId: {
    key: 'deletedMessageId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const messageDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'messageDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { deletedMessageId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })
    const messageResponse = await sdk.GetMessage({ id: deletedMessageId })
    const conversationResponse = await sdk.GetConversation({ id: messageResponse?.data?.note?.conversation_id })
    const healthiePatientId = conversationResponse?.data?.conversation?.patient_id
    await onSuccess({
      data_points: {
        deletedMessageId,
      },
      ...(!isNil(healthiePatientId) && {
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: healthiePatientId,
        }
      }),
    })
  },
}

export type MessageDeleted = typeof messageDeleted
