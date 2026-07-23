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
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const {
      fields: { minuend, subtrahend },
    } = validate({
      schema: z.object({ fields: FieldsValidationSchema }),
      payload,
    })

    const difference = minuend - subtrahend

    helpers.log(
      { meta, minuend, subtrahend, difference },
      'Calculated difference',
    )

    await onComplete({
      data_points: {
        difference: String(difference),
        absoluteDifference: String(Math.abs(difference)),
      },
    })
  },
}
