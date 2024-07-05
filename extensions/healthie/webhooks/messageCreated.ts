import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { formatErrors } from '../lib/sdk/errors'
import { createSdk } from '../lib/sdk/createSdk'

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
      const createdMessageId = payload.resource_id.toString()
      
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
    } catch (error) {
      const formattedError = formatErrors(error)
      await onError(formattedError)
    } 
  },
}

export type MessageCreated = typeof messageCreated
