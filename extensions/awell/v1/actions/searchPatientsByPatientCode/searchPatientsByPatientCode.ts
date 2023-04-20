import { type Action } from '../../../../../lib/types'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category } from '../../../../../lib/types/marketplace'
import { fields, PatientValidationSchema, dataPoints } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { validate } from '../../../../../lib/shared/validation'

export const searchPatientsByPatientCode: Action<
  typeof fields,
  typeof settings
> = {
  key: 'searchPatientsByPatientCode',
  category: Category.WORKFLOW,
  title: 'Search patient (by patient code)',
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

      const numberOfPatientsFound = results.length
      const patientAlreadyExists = numberOfPatientsFound > 0
      const awellPatientIds = results.map((result) => result.id).join(',')

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
