import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const divide: Action<typeof fields, typeof settings> = {
  key: 'divide',
  title: 'Divide',
  description: 'Divide two numbers',
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

    helpers.log({ meta, fields: payload.fields }, 'Processing divide')

    try {
      const {
        fields: { dividend, divisor },
      } = validate({
        schema: z.object({ fields: FieldsValidationSchema }),
        payload,
      })

      const quotient = dividend / divisor

      helpers.log({ meta, dividend, divisor, quotient }, 'Calculated quotient')

      await onComplete({
        data_points: {
          quotient: String(quotient),
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
