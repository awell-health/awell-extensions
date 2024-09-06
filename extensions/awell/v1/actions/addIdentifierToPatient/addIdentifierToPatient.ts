import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  dataPoints,
  FieldsValidationSchema,
  PatientValidationSchema,
} from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { isNil } from 'lodash'

export const addIdentifierToPatient: Action<typeof fields, typeof settings> = {
  key: 'addIdentifierToPatient',
  category: Category.WORKFLOW,
  title: 'Add identifier to patient',
  description: "Add a new identifier to the patient's profile",
  fields,
  dataPoints,
  previewable: false, // We don't have patients in Preview, only cases.
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: { system, value },
      patient: { id: patientId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        patient: PatientValidationSchema,
      }),
      payload,
    })

    const sdk = await helpers.awellSdk()

    const patient = await sdk.orchestration.query({
      patientByIdentifier: {
        __args: {
          system,
          value,
        },
        patient: {
          id: true,
        },
      },
    })

    const patientAlreadyExists = !isNil(patient.patientByIdentifier.patient?.id)

    const isCurrentPatient = patientAlreadyExists
      ? patient.patientByIdentifier.patient?.id === patientId
      : false

    /**
     * If a patient with the identifier already exists and it's the current patient,
     * do nothing. The identifier is already in place, trying to add it again will
     * throw an error
     */
    if (patientAlreadyExists && isCurrentPatient) {
      await onComplete()
      return
    }

    await sdk.orchestration.mutation({
      addIdentifierToPatient: {
        __args: {
          input: {
            patient_id: patientId,
            identifier: {
              system,
              value,
            },
          },
        },
        patient: {
          id: true,
        },
      },
    })

    await onComplete()
  },
}
