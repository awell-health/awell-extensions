import { type Action } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, PatientValidationSchema, dataPoints } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'

export const searchPatientsByPatientCode: Action<
  typeof fields,
  typeof settings
> = {
  key: 'searchPatientsByPatientCode',
  category: Category.WORKFLOW,
  title: 'Search patient by patient code (DEPRECATED, USE IDENTIFIERS)',
  description:
    "Search whether the current patient already exists. Search happens based on the `patient_code` field which is taken from the patient's profile.",
  fields,
  dataPoints,
  previewable: false, // We don't have patients in Preview, only cases.
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings: { apiUrl, apiKey },
        patient: {
          id: patientId,
          profile: { patient_code },
        },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          patient: PatientValidationSchema,
        }),
        payload,
      })

      const sdk = new AwellSdk({ apiUrl, apiKey })

      const results = await sdk.searchPatientsByPatientCode({
        patient_code,
      })

      /**
       * When searching for other patients with the same patient code,
       * we need to exclude the current patient from the search results.
       * Otherwise the result would always be true.
       */
      const resultsWithoutCurrentPatient = results.filter(
        (res) => res.id !== patientId
      )

      const numberOfPatientsFound = resultsWithoutCurrentPatient.length
      const patientAlreadyExists = numberOfPatientsFound > 0
      const awellPatientIds = resultsWithoutCurrentPatient
        .map((result) => result.id)
        .join(',')

      await onComplete({
        data_points: {
          patientAlreadyExists: String(patientAlreadyExists),
          numberOfPatientsFound: String(numberOfPatientsFound),
          awellPatientIds,
        },
      })
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
