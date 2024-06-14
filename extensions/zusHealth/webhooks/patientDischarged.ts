import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import {
  EncounterStatus,
  type AdtEventWebhookPayload,
  HL7EventType,
} from './types'
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
import { type settings } from '../settings'

const dataPoints = {
  resourceId: {
    key: 'resourceId',
    valueType: 'string',
  },
  UPID: {
    key: 'UPID',
    valueType: 'string',
  },
  ownerId: {
    key: 'ownerId',
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
  encounterStart: {
    key: 'encounterStart',
    valueType: 'date',
  },
  encounterEnd: {
    key: 'encounterEnd',
    valueType: 'date',
  },
  HL7EventType: {
    key: 'HL7EventType',
    valueType: 'string',
  },
  HL7EventTypeDescription: {
    key: 'HL7EventTypeDescription',
    valueType: 'string',
  },
  HL7EventTypeFull: {
    key: 'HL7EventTypeFull',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const patientDischarged: Webhook<
  keyof typeof dataPoints,
  AdtEventWebhookPayload,
  typeof settings
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

      if (
        resource.status === EncounterStatus.Discharged &&
        !isNil(resource.period.end)
      ) {
        await onSuccess({
          data_points: {
            resourceId,
            UPID: payload.resource.UPID,
            ownerId: payload.ownerId,
            eventType: EncounterStatus.Discharged,
            encounterStatus: resource.status,
            encounterStart: resource.period.start,
            encounterEnd: resource.period.end,
            HL7EventType: HL7EventType.A03.code,
            HL7EventTypeFull: HL7EventType.A03.fullCode,
            HL7EventTypeDescription: HL7EventType.A03.description,
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
