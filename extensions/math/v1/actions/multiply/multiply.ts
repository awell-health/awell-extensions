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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields } = validate({
      schema: z.object({ fields: FieldsValidationSchema }),
      payload,
    })

    const multiplyAddends = (fields: Fields): number => {
      return Object.values(fields).reduce((acc, curr) => acc * (curr ?? 1), 1)
    }

    const product = multiplyAddends(fields)

    await onComplete({
      data_points: {
        product: String(product),
      },
    })
  },
}
