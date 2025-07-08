import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import {
  type Observation,
  type Reference,
  type Patient,
} from '@medplum/fhirtypes'
import { isNil } from 'lodash'
import { MEDPLUM_IDENTIFIER } from '../../constants'

const dataPoints = {
  observation: {
    key: 'observation',
    valueType: 'json',
  },
  observationId: {
    key: 'observationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const observationCreated: Webhook<
  keyof typeof dataPoints,
  Observation,
  typeof settings
> = {
  key: 'observationCreated',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings },
    onSuccess,
    onError,
  }) => {
    const observation = payload
    const subject = observation?.subject
    const isPatientSubject = subject?.reference?.startsWith('Patient/') ?? false

    /**
     * Observations not attached to a patient don't make much sense to us.
     * So I'm discarding them.
     */
    if (isNil(subject) || !isPatientSubject) {
      await onError({
        response: {
          statusCode: 400,
          message:
            'Missing patient subject reference in Observation payload. Only observations attached to a patient are processed.',
        },
      })
      return
    }

    const subjectAsPatient = subject as Reference<Patient>
    const patientId = subjectAsPatient.reference?.split('/')[1]

    await onSuccess({
      data_points: {
        observation: JSON.stringify(observation),
        observationId: observation.id ?? '',
      },
      ...(!isNil(patientId) && {
        patient_identifier: {
          system: MEDPLUM_IDENTIFIER,
          value: patientId,
        },
      }),
    })
  },
}

export type ObservationCreated = typeof observationCreated
