import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields } from './config'

export const sendDocumentation: Action<typeof fields, typeof settings> = {
  key: 'sendDocumentation',
  title: 'Stuur documentation (mynexuzhealth)',
  description: 'Trigger documentation in the mynexuzhealth app',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    await onComplete()
  },
}
