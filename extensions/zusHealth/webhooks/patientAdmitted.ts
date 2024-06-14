import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import {
  EncounterStatus,
  HL7EventType,
  type AdtEventWebhookPayload,
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

export const patientAdmitted: Webhook<
  keyof typeof dataPoints,
  AdtEventWebhookPayload,
  typeof settings
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

      if (
        resource.status === EncounterStatus.InProgress &&
        !isNil(resource.period.start)
      ) {
        await onSuccess({
          data_points: {
            resourceId,
            UPID: payload.resource.UPID,
            ownerId: payload.ownerId,
            encounterStatus: resource.status,
            encounterStart: resource.period.start,
            eventType: EncounterStatus.Admitted,
            HL7EventType: HL7EventType.A01.code,
            HL7EventTypeFull: HL7EventType.A01.fullCode,
            HL7EventTypeDescription: HL7EventType.A01.description,
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
