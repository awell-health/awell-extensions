import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { type CompletedBlandTextWebhookPayload } from './types'

const dataPoints = {
  conversationId: {
    key: 'conversationId',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  reason: {
    key: 'reason',
    valueType: 'string',
  },
  userNumber: {
    key: 'userNumber',
    valueType: 'string',
  },
  agentNumber: {
    key: 'agentNumber',
    valueType: 'string',
  },
  pathwayId: {
    key: 'pathwayId',
    valueType: 'string',
  },
  messageCount: {
    key: 'messageCount',
    valueType: 'number',
  },
  transcript: {
    key: 'transcript',
    valueType: 'string',
  },
  variables: {
    key: 'variables',
    valueType: 'json',
  },
  conversationObject: {
    key: 'conversationObject',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const completedBlandText: Webhook<
  keyof typeof dataPoints,
  CompletedBlandTextWebhookPayload,
  typeof settings
> = {
  key: 'completedBlandText',
  description:
    'Triggered when a Bland SMS conversation ends (status webhook with channel "sms").',
  dataPoints,
  onEvent: async ({ payload: { payload }, onSuccess, onError }) => {
    const conversationId = payload?.conversation_id
    const awellPatientId: string | undefined =
      payload?.metadata?.awell_patient_id ??
      (payload?.variables?.metadata as Record<string, string> | undefined)
        ?.awell_patient_id

    if (isNil(conversationId)) {
      await onError({
        response: {
          statusCode: 400,
          message: 'Missing conversation_id in payload',
        },
      }); return;
    }

    await onSuccess({
      data_points: {
        conversationId,
        /**
         * The status of the conversation, e.g. "ended".
         */
        status: payload?.status ?? '',
        /**
         * Why the conversation ended,
         * e.g. "Conversation ended at End Call or Transfer Call node".
         */
        reason: payload?.reason ?? '',
        userNumber: payload?.phone_number ?? '',
        agentNumber: payload?.agent_number ?? '',
        pathwayId: payload?.pathway_id ?? '',
        messageCount: payload?.message_count?.toString() ?? '',
        /**
         * The full conversation as a single string
         * ("AGENT: ...\nUSER: ...").
         */
        transcript: payload?.concatenated_transcript ?? '',
        /**
         * Pathway variables captured during the conversation
         * (e.g. opted_out, patient_reply, or custom extraction variables).
         */
        variables: isNil(payload?.variables)
          ? ''
          : JSON.stringify(payload.variables),
        conversationObject: JSON.stringify(payload),
      },
      ...(awellPatientId !== undefined && { patient_id: awellPatientId }),
    })
  },
}

export type CompletedBlandText = typeof completedBlandText
