import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { webhookPayloadSchema } from '../lib/helpers'

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
    const validatedPayload = webhookPayloadSchema.parse(payload)
    const updatedPatientId = validatedPayload.resource_id.toString()

    if (isNil(updatedPatientId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          updatedPatientId,
        },
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: updatedPatientId,
        },
      })
    }
  },
}

export type PatientUpdated = typeof patientUpdated
