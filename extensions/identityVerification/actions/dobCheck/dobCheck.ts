import { Category, validate, type Action } from '@awell-health/extensions-core'
import { z } from 'zod'
import { SettingsValidationSchema, type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const dobCheck: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'dobCheck',
  category: Category.WORKFLOW,
  title: 'DOB verification',
  description:
    'The user will be prompted to enter a dob which will be checked against the dob stored in the patient profile',
  fields,
  previewable: false, // We don't have Awell Hosted Pages in Preview so cannot be previewed.
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing dobCheck')

    try {
      validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      /**
       * Completion happens in Awell Hosted Pages
       */
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
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
