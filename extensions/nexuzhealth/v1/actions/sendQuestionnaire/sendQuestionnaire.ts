import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields } from './config'

export const sendQuestionnaire: Action<typeof fields, typeof settings> = {
  key: 'sendQuestionnaire',
  title: 'Stuur vragenlijst (mynexuzhealth)',
  description: 'Trigger a questionaire in the mynexuzhealth app',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing sendQuestionnaire',
    )

    try {
      await onComplete()
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
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
