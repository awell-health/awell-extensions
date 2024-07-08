import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { webhookPayloadSchema } from '../lib/helpers'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const patientCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload
> = {
  key: 'patientCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const validatedPayload = webhookPayloadSchema.parse(payload)
    const patientId = validatedPayload.resource_id.toString()

    if (isNil(patientId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    } else {
      await onSuccess({
        data_points: {
          patientId,
        },
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: patientId,
        },
      })
    }
  },
}

export type PatientCreated = typeof patientCreated
