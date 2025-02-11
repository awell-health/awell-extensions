import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, FieldsValidationSchema } from './config'
import { z } from 'zod'

export const stopHostedPagesSession: Action<typeof fields, typeof settings> = {
  key: 'stopHostedPagesSession',
  category: Category.WORKFLOW,
  title: 'Stop hosted pages session',
  description: 'Stop the current Hosted Pages session.',
  fields,
  previewable: false, // We don't have Awell Hosted Pages in Preview so cannot be previewed.
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    /**
     * Completion of the activity happens in the Hosted Pages app
     * - Complete the session
     * - Show the success page
     */
  },
}
