import { type Action } from '@awell-health/extensions-core'
import { dataPoints, fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { validateActionFields } from './config/fields'

export const remoteSingleSelect: Action<typeof fields, typeof settings> = {
  key: 'remoteSingleSelect',
  title: 'Dynamic choice selector',
  description:
    'The dynamic choice selector allow you to set up a select question where the available choices are dynamically populated through an API lookup',
  category: Category.FORMS,
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
    validateActionFields(payload.fields)

    /**
     * Completion happens in Awell Hosted Pages
     */
  },
}
