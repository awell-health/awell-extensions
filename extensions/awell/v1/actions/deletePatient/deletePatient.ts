import { type Action } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, PatientValidationSchema } from './config'
import { z } from 'zod'
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
      /**
       * re-throw to be handled inside awell-extension-server
       */
      throw err
    }
  },
}
