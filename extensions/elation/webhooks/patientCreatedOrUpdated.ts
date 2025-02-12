import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type SubscriptionEvent } from '../types/subscription'
import {
  rateLimitDurationSchema,
  transformRateLimitDuration,
} from '../settings'
import { isNil } from 'lodash'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'number',
  },
  patient: {
    key: 'patient',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const patientCreatedOrUpdated: Webhook<
  keyof typeof dataPoints,
  SubscriptionEvent
> = {
  key: 'patientCreatedOrUpdated',
  dataPoints,
  onEvent: async ({
    payload: { payload, settings },
    onSuccess,
    onError,
    helpers: { rateLimiter },
  }) => {
    const { data, resource, action } = payload
    const { id: patientId } = data
    // skip non 'saved' actions for that webhook
    if (action !== 'saved') {
      return
    }

    // rate limiting
    const { success, data: durationString } = rateLimitDurationSchema.safeParse(
      settings.rateLimitDuration,
    )
    if (success === true && !isNil(durationString)) {
      const duration = transformRateLimitDuration(durationString)
      const limiter = rateLimiter('elation-patient', {
        requests: 1,
        duration,
      })
      const { success } = await limiter.limit(patientId.toString())
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
      console.log(`Rate limit success for patient_id=${patientId}`)
    }

    if (resource !== 'patients') {
      await onError({
        response: {
          statusCode: 400,
          message: 'resource must be patients',
        },
      })
    } else {
      await onSuccess({
        data_points: {
          patientId: String(data.id),
          patient: JSON.stringify(data),
        },
        // Review the system used for elation identifiers
        patient_identifier: {
          system: 'https://www.elationhealth.com/',
          value: String(data.id),
        },
      })
    }
  },
}

export type OnCreatePatient = typeof patientCreatedOrUpdated
