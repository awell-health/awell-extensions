import { type Action, Category } from '@awell-health/awell-extensions-types'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { fields, PatientValidationSchema } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { validate } from '../../../../../lib/shared/validation'

export const deletePatient: Action<typeof fields, typeof settings> = {
  key: 'deletePatient',
  category: Category.WORKFLOW,
  title: 'Delete patient',
  description: 'Delete the patient currently enrolled in the care flow.',
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings: { apiUrl, apiKey },
        patient: { id: patientId },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          patient: PatientValidationSchema,
        }),
        payload,
      })

      const sdk = new AwellSdk({ apiUrl, apiKey })

      await sdk.deletePatient({
        patient_id: patientId,
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
