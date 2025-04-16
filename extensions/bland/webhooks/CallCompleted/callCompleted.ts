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
      },
    })
  },
}

export type CallCompleted = typeof callCompleted
