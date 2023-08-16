import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { fields } from './config'
import { z } from 'zod'
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
      /**
       * re-throw to be handled inside awell-extension-server
       */
      throw err
    }
  },
}
