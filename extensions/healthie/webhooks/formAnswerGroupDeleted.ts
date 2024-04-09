import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  deletedFormAnswerGroupId: {
    key: 'deletedFormAnswerGroupId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const formAnswerGroupDeleted: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'formAnswerGroupDeleted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: deletedFormAnswerGroupId } = payload

    if (isNil(deletedFormAnswerGroupId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          deletedFormAnswerGroupId,
        },
      })
    }
  },
}

export type FormAnswerGroupDeleted = typeof formAnswerGroupDeleted
