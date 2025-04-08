import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { ELATION_SYSTEM } from '../constants'
import { type SubscriptionEvent } from '../types/subscription'
import {
  rateLimitDurationSchema,
  transformRateLimitDuration,
} from '../settings'
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
    payload: { payload, settings, endpoint },
    onSuccess,
    onError,
    helpers: { rateLimiter },
  }) => {
    const { action, resource, data } = payload
    const { id: appointmentId, patient: patientId } = data as {
      id: number
      patient: number
    }

    // skip non 'saved'  actions for that webhook
    if (action !== 'saved') {
      return
    }

    // rate limiting
    const { success, data: durationString } = rateLimitDurationSchema.safeParse(
      settings.rateLimitDuration,
    )
    if (success && !isNil(durationString)) {
      const duration = transformRateLimitDuration(durationString)
      const limiter = rateLimiter('elation-appointment', {
        requests: 1,
        duration,
      })
      const key = `${endpoint?.id ?? 'global'}-${appointmentId}`
      const { success } = await limiter.limit(key)
      if (!success) {
        await onError({
          response: {
            statusCode: 200,
            message: `Rate limit exceeded. 200 OK response sent to Elation to prevent further requests for appointment ${appointmentId} on endpoint ${endpoint?.url ?? 'global'}.`,
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
