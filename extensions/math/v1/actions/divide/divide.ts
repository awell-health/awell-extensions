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
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

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
  },
}
