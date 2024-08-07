import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z } from 'zod'

export const serializeJson: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'serializeJson',
  title: 'Serialize JSON',
  description: 'Serialize a JSON object',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { json },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    await onComplete({
      data_points: {
        serializedJson: JSON.stringify(json),
      },
    })
  },
}
