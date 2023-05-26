import { type Action, Category } from '@awell-health/awell-extensions-types'
import { SettingsValidationSchema, type settings } from '../../settings'
import { fields } from './config'
import { fromZodError } from 'zod-validation-error'
import { z, ZodError } from 'zod'
import { validate } from '../../../../lib/shared/validation'
import { FieldsValidationSchema } from './config/fields'

export const uploadFiles: Action<typeof fields, typeof settings> = {
  key: 'uploadFiles',
  title: 'Upload files',
  description: 'Allow a stakeholder to upload one or multiple files.',
  category: Category.CONTENT_AND_FILES,
  fields,
  // Future improvement: ingest uploaded file URLs as data points into the care flow
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false, // We don't have Awell Hosted Pages in Preview so cannot be previewed.
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      /**
       * Completion happens in Awell Hosted Pages
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
