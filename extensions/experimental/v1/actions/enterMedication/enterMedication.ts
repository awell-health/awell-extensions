import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints } from './config'

export const enterMedication: Action<typeof fields, typeof settings> = {
  key: 'enterMedication',
  category: Category.FORMS,
  title: 'Enter medication',
  description: 'Allow a user to enter medication',
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
