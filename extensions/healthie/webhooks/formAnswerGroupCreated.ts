import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  createdFormAnswerGroupId: {
    key: 'createdFormAnswerGroupId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const formAnswerGroupCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'formAnswerGroupCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: createdFormAnswerGroupId } = payload

    if (isNil(createdFormAnswerGroupId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          createdFormAnswerGroupId,
        },
      })
    }
  },
}

export type FormAnswerGroupCreated = typeof formAnswerGroupCreated
