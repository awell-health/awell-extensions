import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { type DocuSignWebhookPayload, DocuSignWebhookPayloadSchema } from './types'

const dataPoints = {
  signed: {
    key: 'signed',
    valueType: 'boolean',
  },
  envelopeId: {
    key: 'envelopeId',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  completedTimestamp: {
    key: 'completedTimestamp',
    valueType: 'date',
  },
  event: {
    key: 'event',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const signingCompleted: Webhook<
  keyof typeof dataPoints,
  DocuSignWebhookPayload,
  typeof settings
> = {
  key: 'signingCompleted',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings },
    onSuccess,
    onError,
  }) => {
    const validatedPayload = DocuSignWebhookPayloadSchema.parse(payload)
    
    const envelopeId = validatedPayload.data.envelopeId
    const event = validatedPayload.event
    
    if (isNil(envelopeId)) {
      await onError({
        response: {
          statusCode: 400,
          message: 'Missing envelopeId in webhook payload',
        },
      })
      return
    }

    const signed = 
      event === 'recipient-completed' || 
      event === 'envelope-completed'
    
    const status = validatedPayload.data.envelopeSummary?.status || 
                   validatedPayload.data.recipientStatus || 
                   'unknown'

    const completedTimestamp = 
      validatedPayload.data.completedDateTime ||
      validatedPayload.data.envelopeSummary?.completedDateTime ||
      validatedPayload.data.envelopeSummary?.statusChangedDateTime ||
      new Date().toISOString()

    await onSuccess({
      data_points: {
        signed: signed.toString(),
        envelopeId,
        status,
        completedTimestamp,
        event: event || 'unknown',
      },
    })
  },
}

export type SigningCompleted = typeof signingCompleted
