import { type Action } from '../../../../../lib/types'
import { validateSettings, type settings } from '../../../settings'
import { Category } from '../../../../../lib/types/marketplace'
import { fields, validatePatientFields } from './config'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'

export const deletePatient: Action<typeof fields, typeof settings> = {
  key: 'deletePatient',
  category: Category.WORKFLOW,
  title: 'Delete patient',
  description: 'Delete the patient currently enrolled in the care flow.',
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { apiUrl, apiKey } = validateSettings(payload.settings)
      const { id: patientId } = validatePatientFields(payload.patient)

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
