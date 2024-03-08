import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints } from './config'

export const requestVideoVisit: Action<typeof fields, typeof settings> = {
  key: 'requestVideoVisit',
  category: Category.WORKFLOW,
  title: 'Request video visit',
  description:
    'Allow user to choose between requesting a video visit or simply continue',
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
