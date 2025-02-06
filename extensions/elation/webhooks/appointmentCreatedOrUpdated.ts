import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { ELATION_SYSTEM } from '../constants'
import { type SubscriptionEvent } from '../types/subscription'
import { rateLimitDurationSchema } from '../settings'
import { isNil } from 'lodash'

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
  onEvent: async ({
    payload: { payload, settings },
    onSuccess,
    onError,
    helpers: { rateLimiter },
  }) => {
    const { action, resource, data } = payload
    const { id: appointmentId, patient: patientId } = data

    // skip non 'saved'  actions for that webhook
    if (action !== 'saved') {
      return
    }

    // rate limiting
    const { success, data: duration } = rateLimitDurationSchema.safeParse(
      settings.rateLimitDuration,
    )
    if (success === true && !isNil(duration)) {
      const limiter = rateLimiter('elation-appointment', {
        requests: 1,
        duration,
      })
      const { success } = await limiter.limit(appointmentId.toString())
      if (!success) {
        console.warn({
          data,
          resource,
          action,
          message:
            'Rate limit exceeded. 200 OK response sent to Elation to prevent further requests.',
        })
        await onError({
          response: {
            statusCode: 200,
            message:
              'Rate limit exceeded. 200 OK response sent to Elation to prevent further requests.',
          },
        })
        return
      }
      console.log(`Rate limit success for appointment_id=${appointmentId}`)
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
