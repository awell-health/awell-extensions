import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields } from './config'

export const sendDocumentation: Action<typeof fields, typeof settings> = {
  key: 'sendDocumentation',
  title: 'Stuur documentatie (mynexuzhealth)',
  description: 'Trigger documentation in the mynexuzhealth app',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    helpers.log({ fields: payload.fields }, 'Processing sendDocumentation')

    try {
      await onComplete()
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
