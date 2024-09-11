import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { formatError } from '../lib/sdk/graphql-codegen/errors'
import { createSdk } from '../lib/sdk/graphql-codegen/createSdk'
import { webhookPayloadSchema } from '../lib/helpers'

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
    try {
      const { sdk } = await createSdk({ settings })

      const validatedPayload = webhookPayloadSchema.parse(payload)
      const createdMessageId = validatedPayload.resource_id.toString()

      const messageResponse = await sdk.getMessage({ id: createdMessageId })
      const conversationResponse = await sdk.getConversation({
        id: messageResponse?.data?.note?.conversation_id,
      })
      const healthiePatientId =
        conversationResponse?.data?.conversation?.patient_id
      await onSuccess({
        data_points: {
          createdMessageId,
        },
        ...(!isNil(healthiePatientId) && {
          patient_identifier: {
            system: HEALTHIE_IDENTIFIER,
            value: healthiePatientId,
          },
        }),
      })
    } catch (error) {
      await onError(formatError(error))
    }
  },
}

export type MessageCreated = typeof messageCreated
