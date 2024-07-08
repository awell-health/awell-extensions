import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { createSdk } from '../lib/sdk/createSdk'
import { formatError } from '../lib/sdk/errors'

const dataPoints = {
  updatedTaskId: {
    key: 'updatedTaskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const taskUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'taskUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({ settings })
      const updatedTaskId = payload.resource_id.toString()

      const response = await sdk.getTask({ id: updatedTaskId })
      const healthiePatientId = response?.data?.task?.client_id
      await onSuccess({
        data_points: {
          updatedTaskId,
        },
        ...(!isNil(healthiePatientId) && {
          patient_identifier: {
            system: HEALTHIE_IDENTIFIER,
            value: healthiePatientId,
          },
        }),
      })
    } catch (error) {
      await onError(formatError(error))
    }
  }
}

export type TaskUpdated = typeof taskUpdated
