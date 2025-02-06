import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { ELATION_SYSTEM } from '../constants'
import { type SubscriptionEvent } from '../types/subscription'
import { createHash } from 'node:crypto'
import { Duration } from '@upstash/ratelimit'
import { rateLimitDurationSchema, SettingsValidationSchema } from '../settings'
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
    helpers,
  }) => {
    const { action, resource, data } = payload
    const { id: appointmentId, patient: patientId } = data

    // skip non 'saved'  actions for that webhook
    if (action !== 'saved') {
      return
    }

    const rateLimitDuration = rateLimitDurationSchema.parse(
      settings.rateLimitDuration,
    )

    if (!isNil(rateLimitDuration)) {
      const rateLimiter = helpers.rateLimit(1, rateLimitDuration as Duration)
      const strAppt = JSON.stringify(data)
      const uniqueHash = createHash('sha256').update(strAppt).digest('hex')
      // i'd rather use the unique hash here, but instead using an appointment ID
      const { success } = await rateLimiter.limit(
        `elation-appointment-${appointmentId}`,
      )
      if (!success) {
        console.log(`ELATION: Rate limited for appointment_id=${appointmentId}`)
        // we're sending a 200 response to elation to avoid them retrying the request
        await onError({
          response: {
            statusCode: 200,
            message: 'Rate limit exceeded',
          },
        })
        return
      }
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
