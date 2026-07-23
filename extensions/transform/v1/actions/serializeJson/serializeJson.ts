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
  onEvent: async ({ payload, onComplete, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const {
      fields: { json },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const serializedJson = JSON.stringify(json)
    helpers.log({ meta, json, serializedJson }, 'Serialized JSON')

    await onComplete({
      data_points: {
        serializedJson,
      },
    })
  },
}
