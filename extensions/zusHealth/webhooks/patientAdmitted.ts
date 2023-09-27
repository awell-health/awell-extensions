import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type AdtEventWebhookPayload } from './types'
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

export const patientAdmitted: Webhook<
  keyof typeof dataPoints,
  AdtEventWebhookPayload
> = {
  key: 'patientAdmitted',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      let { resourceId } = payload

      if (isNil(resourceId)) {
        await onError({})
      }

      resourceId = startsWithEncounter.parse(payload.resourceId)

      const api = makeAPIClient(settings)
      const resource = await api.getResource(resourceId)

      if (resource.status === 'in-progress' && !isNil(resource.period.start)) {
        await onSuccess({
          data_points: {
            resourceId,
            UPID: payload.resource.UPID,
            userId: payload.ownerId,
            eventType: 'admit',
            encounterStatus: 'in-progress',
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

export type PatientAdmitted = typeof patientAdmitted
