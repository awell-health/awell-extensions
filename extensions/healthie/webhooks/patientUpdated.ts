import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../lib/types'

const dataPoints = {
  updatedPatientId: {
    key: 'updatedPatientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const patientUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'patientUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resource_id: updatedPatientId } = payload

    if (isNil(updatedPatientId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          updatedPatientId,
        },
      })
    }
  },
}

export type PatientUpdated = typeof patientUpdated
