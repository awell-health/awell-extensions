import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints } from './config'

export const collectMedication: Action<typeof fields, typeof settings> = {
  key: 'collectMedication',
  category: Category.FORMS,
  title: 'Collect medication',
  description: 'Collect medication from the user',
  fields,
  dataPoints,
  options: {
    stakeholders: {
      label: 'Stakeholder',
      mode: 'single',
    },
  },
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    // Completion happens in Hosted Pages
  },
}
