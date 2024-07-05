import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { createSdk } from '../lib/sdk/createSdk'
import { formatErrors } from '../lib/sdk/errors'


const dataPoints = {
  createdTaskId: {
    key: 'createdTaskId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const taskCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'taskCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({ settings })
      const createdTaskId = payload.resource_id.toString()
  
      const response = await sdk.getTask({ id: createdTaskId })
      const healthiePatientId = response?.data?.task?.client_id
      await onSuccess({
        data_points: {
          createdTaskId,
        },
        ...(!isNil(healthiePatientId) && {
          patient_identifier: {
            system: HEALTHIE_IDENTIFIER,
            value: healthiePatientId,
          },
        }),
      })
    } catch (error) {
      const formattedError = formatErrors(error)
      await onError(formattedError)
    }
  },
}

export type TaskCreated = typeof taskCreated
