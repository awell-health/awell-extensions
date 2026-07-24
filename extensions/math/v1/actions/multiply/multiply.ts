import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

type Fields = z.infer<typeof FieldsValidationSchema>

export const multiply: Action<typeof fields, typeof settings> = {
  key: 'multiply',
  title: 'Multiply',
  description: 'Multiply a series of numbers to get a final product',
  category: Category.MATH,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing multiply')

    try {
      const { fields } = validate({
        schema: z.object({ fields: FieldsValidationSchema }),
        payload,
      })

      const multiplyAddends = (fields: Fields): number => {
        return Object.values(fields).reduce((acc, curr) => acc * (curr ?? 1), 1)
      }

      const product = multiplyAddends(fields)

      helpers.log({ meta, fields, product }, 'Calculated product')

      await onComplete({
        data_points: {
          product: String(product),
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
