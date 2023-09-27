import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type PatientDischargedWebhookPayload } from './types'
import { makeAPIClient } from '../client'
import { startsWithEncounter } from '../validation'
import {
  isAxiosError,
  isZodError,
  parseAxiosError,
  parseUnknowError,
  parseZodError,
} from '../utils'
import { type AxiosError } from 'axios'

const dataPoints = {
  resourceId: {
    key: 'resourceId',
    valueType: 'string',
  },
  UPID: {
    key: 'UPID',
    valueType: 'string',
  },
  userId: {
    key: 'userId',
    valueType: 'string',
  },
  eventType: {
    key: 'eventType',
    valueType: 'string',
  },
  encounterStatus: {
    key: 'encounterStatus',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const patientDischarged: Webhook<
  keyof typeof dataPoints,
  PatientDischargedWebhookPayload
> = {
  key: 'patientDischarged',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      let { resourceId } = payload

      if (isNil(resourceId)) {
        await onError({})
      }

      resourceId = startsWithEncounter.parse(resourceId)

      const api = makeAPIClient(settings)
      const resource = await api.getResource(resourceId)

      if (resource.status === 'discharged' && !isNil(resource.period.end)) {
        await onSuccess({
          data_points: {
            resourceId,
            UPID: resource.subject?.reference,
            userId: resource.participant?.type?.individual?.reference,
            eventType: 'discharged',
            encounterStatus: 'discharged',
          },
        })
      }
    } catch (error) {
      let parsedError

      if (isZodError(error)) {
        parsedError = parseZodError(error)
      } else if (isAxiosError(error)) {
        parsedError = parseAxiosError(error as AxiosError)
      } else {
        parsedError = parseUnknowError(error as Error)
      }
      await onError({
        events: [parsedError],
      })
    }
  },
}

export type PatientDischarged = typeof patientDischarged
