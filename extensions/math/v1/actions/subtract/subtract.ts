import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const subtract: Action<typeof fields, typeof settings> = {
  key: 'subtract',
  title: 'Subtract',
  description: 'Calculate the difference between two numbers',
  category: Category.MATH,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: { minuend, subtrahend },
    } = validate({
      schema: z.object({ fields: FieldsValidationSchema }),
      payload,
    })

    const difference = minuend - subtrahend

    await onComplete({
      data_points: {
        difference: String(difference),
        absoluteDifference: String(Math.abs(difference)),
      },
    })
  },
}
