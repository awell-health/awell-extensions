import { type Action } from '../../../../../lib/types'
import { validateSettings, type settings } from '../../../settings'
import { Category } from '../../../../../lib/types/marketplace'
import { fields, validateActionFields, validatePatientFields } from './config'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'

export const updatePatient: Action<typeof fields, typeof settings> = {
  key: 'startCareFlow',
  category: Category.WORKFLOW,
  title: 'Start care flow',
  description: 'Start a new care flow from within the current care flow.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { apiUrl, apiKey } = validateSettings(payload.settings)
      const {
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
      } = validateActionFields(payload.fields)
      const { id: patientId } = validatePatientFields(payload.patient)

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
