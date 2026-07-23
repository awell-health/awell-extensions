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
  previewable: false,
  onEvent: async ({ payload, onComplete, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const {
      fields: { list },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const output = list.join(',')
    helpers.log(
      { meta, list, output },
      'Converted list to comma separated text',
    )

    await onComplete({
      data_points: {
        listText: output,
      },
    })
  },
}
