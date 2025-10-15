import { type Action } from '@awell-health/extensions-core'
import { dataPoints, fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'

export const embeddedSigning: Action<typeof fields, typeof settings> = {
  key: 'embeddedSigning',
  title: 'Embedded signing',
  description:
    'Let a stakeholder sign an embedded signature request with Awell Hosted Pages.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false, // We don't have Awell Hosted Pages in Preview so cannot be previewed.
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const fields = validateActionFields(payload.fields)
      
      /**
       * If webhook is configured, don't complete the activity.
       * The webhook will handle completion when signing is done.
       * This follows the same pattern as Bland AI's sendCall action.
       */
      if (fields.webhook) {
        return
      }
      
      /**
       * If no webhook (legacy behavior), complete immediately.
       * This maintains backward compatibility for hosted pages implementations
       * that use completeExtensionActivity mutation.
       */
      await onComplete({
        data_points: {
          signed: String(false), // Will be updated by completeExtensionActivity
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
