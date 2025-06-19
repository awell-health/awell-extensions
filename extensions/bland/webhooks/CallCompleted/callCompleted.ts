import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { type CallCompletedWebhookPayload } from './types'

const dataPoints = {
  callId: {
    key: 'callId',
    valueType: 'string',
  },
  callObject: {
    key: 'callObject',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const callCompleted: Webhook<
  keyof typeof dataPoints,
  CallCompletedWebhookPayload,
  typeof settings
> = {
  key: 'callCompleted',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings },
    onSuccess,
    onError,
  }) => {
    const callId = payload?.call_id
    const awellPatientId: string | undefined =
      payload?.variables?.metadata?.awell_patient_id

    if (isNil(callId)) {
      await onError({
        response: {
          statusCode: 400,
          message: 'Missing call_id in payload',
        },
      })
    }

    await onSuccess({
      data_points: {
        callId,
        callObject: JSON.stringify(payload),
      },
      ...(awellPatientId !== undefined && { patient_id: awellPatientId }),
    })
  },
}

export type CallCompleted = typeof callCompleted
