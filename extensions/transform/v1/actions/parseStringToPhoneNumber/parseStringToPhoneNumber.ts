import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z } from 'zod'

export const parseStringToPhoneNumber: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'parseStringToPhoneNumber',
  title: 'Parse text to phone number',
  description: 'Transform or parse text to a phone number.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete) => {
    const {
      fields: { text },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    await onComplete({
      data_points: {
        phoneNumber: String(text),
      },
    })
  },
}
