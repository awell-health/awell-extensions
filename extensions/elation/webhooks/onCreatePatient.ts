import { type DataPointDefinition, type Webhook } from '../../../lib/types'
import { type PatientResponse } from '../types/patient'
import { type SubscriptionEvent } from '../types/subscription'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const onCreatePatient: Webhook<
  keyof typeof dataPoints,
  SubscriptionEvent
> = {
  key: 'onCreatePatient',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    if (payload.resource !== 'patients') {
      await onError({
        response: {
          statusCode: 400,
          message: 'wrong data resource'
        }
      })
    } else {
      const patientInfo = payload.data as PatientResponse
      await onSuccess( {
        data_points: { patientId: String(patientInfo.id) },
      })
    }
  },
}
