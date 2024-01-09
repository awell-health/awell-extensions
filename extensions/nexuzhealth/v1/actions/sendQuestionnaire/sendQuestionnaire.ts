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
  onActivityCreated: async (payload, onComplete, onError) => {
    await onComplete()
  },
}
