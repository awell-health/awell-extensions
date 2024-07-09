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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: { dividend, divisor },
    } = validate({
      schema: z.object({ fields: FieldsValidationSchema }),
      payload,
    })

    const quotient = dividend / divisor

    await onComplete({
      data_points: {
        quotient: String(quotient),
      },
    })
  },
}
