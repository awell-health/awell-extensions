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
  onActivityCreated: async (payload, onComplete, onError) => {
    await onComplete()
  },
}
