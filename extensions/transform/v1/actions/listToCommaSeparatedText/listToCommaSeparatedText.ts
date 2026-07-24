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
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    helpers.log(
      { fields: payload.fields },
      'Processing listToCommaSeparatedText',
    )

    try {
      const {
        fields: { list },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const output = list.join(',')
      helpers.log({ list, output }, 'Converted list to comma separated text')

      await onComplete({
        data_points: {
          listText: output,
        },
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
