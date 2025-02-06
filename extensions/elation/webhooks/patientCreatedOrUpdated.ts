import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type SubscriptionEvent } from '../types/subscription'
import { Duration } from '@upstash/ratelimit'
import { rateLimitDurationSchema } from '../settings'
import { createHash } from 'node:crypto'
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
  onEvent: async ({ payload: { payload, settings }, onSuccess, onError }) => {
    const { data, resource, action } = payload
    const { id: patientId } = data

    // skip non 'saved' actions for that webhook
    if (action !== 'saved') {
      return
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
