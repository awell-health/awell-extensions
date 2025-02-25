import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { MEDPLUM_IDENTIFIER, type MedplumWebhookPayload } from './types'
import { webhookPayloadSchema } from './schemas'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const patientCreated: Webhook<
  keyof typeof dataPoints,
  MedplumWebhookPayload
> = {
  key: 'patientCreated',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess, onError) => {
    const validatedPayload = webhookPayloadSchema.parse(payload)
    const patientId = validatedPayload.id

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
          system: MEDPLUM_IDENTIFIER,
          value: patientId,
        },
      })
    }
  },
}

export type PatientCreated = typeof patientCreated