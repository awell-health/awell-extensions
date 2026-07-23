import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z } from 'zod'

export const feetAndInchesToInches: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'feetAndInchesToInches',
  title: 'Feet and inches to inches',
  description: 'Transform feet and inches to inches',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing feetAndInchesToInches',
    )

    try {
      const {
        fields: { feet, inches },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const totalInches = feet * 12 + inches

      helpers.log({ meta, feet, inches, totalInches }, 'Converted to inches')

      await onComplete({
        data_points: {
          inches: String(totalInches),
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
