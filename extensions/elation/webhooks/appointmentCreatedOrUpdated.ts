import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type SubscriptionEvent } from '../types/subscription'

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const appointmentCreatedOrUpdated: Webhook<
  keyof typeof dataPoints,
  SubscriptionEvent
> = {
  key: 'appointmentCreatedOrUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { data: appointmentResource, resource, action } = payload
    const { patient: patientId } = appointmentResource
    // skip non 'saved' actions for that webhook
    if (action !== 'saved') {
      return
    }

    if (resource !== 'appointments') {
      await onError({
        response: {
          statusCode: 400,
          message: 'resource must be apppointments',
        },
      })
    } else {
      await onSuccess({
        data_points: { appointmentId: String(appointmentResource.id) },
        patient_identifier: {
          system: 'https://www.elationhealth.com/',
          value: String(patientId),
        },
      })
    }
  },
}

export type OnCreateOrUpdateAppointment = typeof appointmentCreatedOrUpdated
