import { type Action } from '../../../../../lib/types'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category } from '../../../../../lib/types/marketplace'
import {
  fields,
  FieldsValidationSchema,
  PatientValidationSchema,
} from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { validate } from '../../../../../lib/shared/validation'

export const updatePatient: Action<typeof fields, typeof settings> = {
  key: 'updatePatient',
  category: Category.WORKFLOW,
  title: 'Update patient',
  description: 'Update the current patient with new data.',
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings: { apiUrl, apiKey },
        fields: {
          patientCode,
          firstName,
          lastName,
          birthDate,
          email,
          phone,
          mobilePhone,
          street,
          state,
          country,
          city,
          zip,
          preferredLanguage,
          sex,
        },
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

      await sdk.updatePatient({
        patient_id: patientId,
        profile: {
          patient_code: patientCode,
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          email,
          phone,
          mobile_phone: mobilePhone,
          address: {
            street,
            state,
            country,
            city,
            zip,
          },
          preferred_language: preferredLanguage,
          sex,
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
