import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'

const dataPoints = {
  signedFormAnswerGroupId: {
    key: 'signedFormAnswerGroupId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const formAnswerGroupSigned: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'formAnswerGroupSigned',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: signedFormAnswerGroupId } = payload

    if (isNil(signedFormAnswerGroupId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          signedFormAnswerGroupId,
        },
      })
    }
  },
}

export type FormAnswerGroupSigned = typeof formAnswerGroupSigned
