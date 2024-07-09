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
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { feet, inches },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const totalInches = feet * 12 + inches

    await onComplete({
      data_points: {
        inches: String(totalInches),
      },
    })
  },
}
