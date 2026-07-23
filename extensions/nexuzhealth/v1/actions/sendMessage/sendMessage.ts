import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields } from './config'

export const sendMessage: Action<typeof fields, typeof settings> = {
  key: 'sendMessage',
  title: 'Stuur bericht (mynexuzhealth)',
  description: 'Trigger a message in the mynexuzhealth app',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing sendMessage')

    await onComplete()
  },
}
