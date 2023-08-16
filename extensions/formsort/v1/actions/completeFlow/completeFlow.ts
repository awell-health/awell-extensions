import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { validateActionFields } from './config/fields'

export const completeFlow: Action<typeof fields, typeof settings> = {
  key: 'completeFlow',
  title: 'Complete flow',
  description:
    'Let a stakeholder complete a Formsort flow with Awell Hosted Pages.',
  category: Category.FORMS,
  fields,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false, // We don't have Awell Hosted Pages in Preview so cannot be previewed.
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      validateActionFields(payload.fields)
    } catch (err) {
      /**
       * re-throw to be handled inside awell-extension-server
       */
      throw err
    }
  },
}
