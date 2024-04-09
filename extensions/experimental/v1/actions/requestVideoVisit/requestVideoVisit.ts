import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const requestVideoVisit: Action<typeof fields, typeof settings> = {
  key: 'requestVideoVisit',
  category: Category.WORKFLOW,
  title: 'Request video visit',
  description:
    'Allow user to choose between requesting a video visit or simply continue',
  fields,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      /**
       * Completion happens in Hosted Pages
       */
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
