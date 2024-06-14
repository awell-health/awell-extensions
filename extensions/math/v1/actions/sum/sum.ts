import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

type Fields = z.infer<typeof FieldsValidationSchema>

export const sum: Action<typeof fields, typeof settings> = {
  key: 'sum',
  title: 'Sum',
  description: 'Calculate the sum of two or more addends',
  category: Category.MATH,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields } = validate({
      schema: z.object({ fields: FieldsValidationSchema }),
      payload,
    })

    const sumAddends = (fields: Fields): number => {
      return Object.values(fields).reduce((acc, curr) => acc + (curr ?? 0), 0)
    }

    const sum = sumAddends(fields)

    await onComplete({
      data_points: {
        sum: String(sum),
      },
    })
  },
}
