import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { kebabCase } from 'lodash'

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
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const placeholderPattern = /{{\s*placeholder\s*}}/
      const sanetizedValue = kebabCase(value)
      const url = urlTemplate.replace(placeholderPattern, sanetizedValue)

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
