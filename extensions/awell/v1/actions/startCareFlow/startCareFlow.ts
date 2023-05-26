import { type Action, Category } from '@awell-health/awell-extensions-types'
import { SettingsValidationSchema, type settings } from '../../../settings'
import {
  fields,
  PatientValidationSchema,
  FieldsValidationSchema,
  dataPoints,
} from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { validate } from '../../../../../lib/shared/validation'

export const startCareFlow: Action<typeof fields, typeof settings> = {
  key: 'startCareFlow',
  category: Category.WORKFLOW,
  title: 'Start care flow',
  description:
    'Start a new care flow for the patient currently enrolled in the care flow.',
  fields,
  dataPoints,
  previewable: false, // We don't have pathways in Preview, only cases.
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings: { apiUrl, apiKey },
        fields: { pathwayDefinitionId, baselineInfo },
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

      const careFlowId = await sdk.startCareFlow({
        patient_id: patientId,
        pathway_definition_id: pathwayDefinitionId,
        data_points: baselineInfo,
      })

      await onComplete({
        data_points: {
          careFlowId,
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
