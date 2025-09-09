import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z } from 'zod'

export const listToCommaSeparatedText: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'listToCommaSeparatedText',
  title: 'List to comma separated text',
  description:
    'Transform or parse list (string array) to a comma separated text.',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete) => {
    const {
      fields: { list },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const output = list.join(',')
    await onComplete({
      data_points: {
        listText: output,
      },
    })
  },
}
