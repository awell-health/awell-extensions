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
  completed: {
    key: 'completed',
    valueType: 'boolean',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  answeredBy: {
    key: 'answeredBy',
    valueType: 'string',
  },
  errorMessage: {
    key: 'errorMessage',
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
        /**
         * Whether the call has been completed.
         * This doesn't tell anything about the outcome of the call. That's what status is for
         */
        completed: payload?.completed?.toString() ?? '',
        /**
         * The status of the call
         * completed - Call was successfully completed, this can be both human or voicemail answered (see answered_by for details on who the call was answered by)
         * failed - Call failed to connect or complete (see error_message for details)
         * busy - Called number was busy
         * no-answer - Call was not answered
         * canceled - Call was canceled before completion
         * unknown - Status could not be determined
         */
        status: payload?.status ?? '',
        /**
         * human: The call was answered by a human.
         * voicemail: The call was answered by an answering machine or voicemail.
         * unknown: There was not enough audio at the start of the call to make a determination.
         * no-answer: The call was not answered.
         * null: Not enabled, or still processing the result.
         */
        answeredBy: payload?.answered_by ?? '',
        /**
         * If an error occurs, this will contain a description of the error. Otherwise, it will be null.
         */
        errorMessage: payload?.error_message ?? '',
      },
      ...(awellPatientId !== undefined && { patient_id: awellPatientId }),
    })
  },
}

export type CallCompleted = typeof callCompleted
