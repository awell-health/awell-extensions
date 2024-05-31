import { type Action } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  dataPoints,
  FieldsValidationSchema,
  PatientValidationSchema,
} from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { AwellSdk } from '@awell-health/awell-sdk'
import { isNil } from 'lodash'

export const addIdentifierToPatient: Action<typeof fields, typeof settings> = {
  key: 'addIdentifierToPatient',
  category: Category.WORKFLOW,
  title: 'Add identifier to patient',
  description: "Add a new identifier to the patient's profile",
  fields,
  dataPoints,
  previewable: false, // We don't have patients in Preview, only cases.
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        fields: { system, value },
        settings: { apiUrl, apiKey },
        patient: { id: patientId },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
          patient: PatientValidationSchema,
        }),
        payload,
      })

      const sdk = new AwellSdk({ apiUrl, apiKey })

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

      const patientAlreadyExists = !isNil(
        patient.patientByIdentifier.patient?.id
      )

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
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: {
                category: 'WRONG_INPUT',
                message: `${error.message}`,
              },
            },
          ],
        })
        return
      }

      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Awell API reported an error' },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
