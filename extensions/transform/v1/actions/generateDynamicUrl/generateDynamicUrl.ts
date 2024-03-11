import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import {
  FieldsValidationSchema,
  dataPoints,
  fields,
  PathwayValidationSchema,
} from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { isEmpty } from 'lodash'

export const generateDynamicUrl: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'generateDynamicUrl',
  title: 'Generate dynamic URL',
  description:
    'Generate a dynamic URL based on a URL template with a placeholder and a data point',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { urlTemplate, value },
        pathway: { id: pathwayId },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          pathway: PathwayValidationSchema,
        }),
        payload,
      })

      const placeholderPattern = /\[placeholder\]/g
      const valueForUrl = isEmpty(value) ? pathwayId : String(value)
      const url = urlTemplate.replace(placeholderPattern, valueForUrl)

      await onComplete({
        data_points: {
          url,
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: {
                category: 'WRONG_INPUT',
                message: `${error.message}`,
              },
            },
          ],
        })
        return
      }

      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
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
