import { type Action } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import AwellSdk from '../../sdk/awellSdk'
import { isNil } from 'lodash'

export const getPatientByIdentifier: Action<typeof fields, typeof settings> = {
  key: 'getPatientByIdentifier',
  category: Category.WORKFLOW,
  title: 'Get patient by identifier',
  description:
    'Retrieve a patient based on the provided identifier system and value',
  fields,
  dataPoints,
  previewable: false, // We don't have patients in Preview, only cases.
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        fields: { system, value },
        settings: { apiUrl, apiKey },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const sdk = new AwellSdk({ apiUrl, apiKey })

      const patient = await sdk.getPatientByIdentifier({
        system,
        value,
      })

      if (isNil(patient)) {
        await onComplete({
          data_points: {
            patientAlreadyExists: String(false),
            patientId: undefined,
          },
        })
        return
      }

      await onComplete({
        data_points: {
          patientAlreadyExists: String(true),
          patientId: patient.id,
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
