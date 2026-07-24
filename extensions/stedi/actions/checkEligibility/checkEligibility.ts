import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const checkEligibility: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkEligibility',
  category: Category.BILLING,
  title: 'Check eligibility',
  description:
    'This is a dummy action that checks eligibility for a given request.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing checkEligibility')

    try {
      const { fields } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      await onComplete({
        data_points: {
          data: fields.data,
        },
      })
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
