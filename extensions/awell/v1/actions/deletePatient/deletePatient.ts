import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, PatientValidationSchema } from './config'
import { z } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const deletePatient: Action<typeof fields, typeof settings> = {
  key: 'deletePatient',
  category: Category.WORKFLOW,
  title: 'Delete patient',
  description: 'Delete the patient currently enrolled in the care flow.',
  fields,
  previewable: false,
  onEvent: async ({
    payload,
    onComplete,
    helpers: { awellSdk },
  }): Promise<void> => {
    const {
      patient: { id: patientId },
    } = validate({
      schema: z.object({
        patient: PatientValidationSchema,
      }),
      payload,
    })

    const { apiKey, apiUrl } = await awellSdk()

    const sdk = new AwellSdk({ apiKey, apiUrl: apiUrl as string })

    await sdk.deletePatient({
      patient_id: patientId,
    })

    await onComplete({
      events: [
        addActivityEventLog({
          message: `Patient with id ${patientId} was deleted.`,
        }),
      ],
    })
  },
}
