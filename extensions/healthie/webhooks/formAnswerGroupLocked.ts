import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
  lockedFormAnswerGroupId: {
    key: 'lockedFormAnswerGroupId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const formAnswerGroupLocked: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'formAnswerGroupLocked',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: lockedFormAnswerGroupId } = payload

    if (isNil(lockedFormAnswerGroupId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          lockedFormAnswerGroupId,
        },
      })
    }
  },
}

export type FormAnswerGroupLocked = typeof formAnswerGroupLocked
