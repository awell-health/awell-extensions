import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { ELATION_SYSTEM } from '../constants'
import { type SubscriptionEvent } from '../types/subscription'

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'number',
  },
  appointment: {
    key: 'appointment',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const appointmentCreatedOrUpdated: Webhook<
  keyof typeof dataPoints,
  SubscriptionEvent
> = {
  key: 'appointmentCreatedOrUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { action, resource, data } = payload
    const { id: appointmentId, patient: patientId } = data

    // skip non 'saved'  actions for that webhook
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
        data_points: {
          appointmentId: String(appointmentId),
          appointment: JSON.stringify(data),
        },
        patient_identifier: {
          system: ELATION_SYSTEM,
          value: String(patientId),
        },
      })
    }
  },
}

export type OnCreateOrUpdateAppointment = typeof appointmentCreatedOrUpdated
