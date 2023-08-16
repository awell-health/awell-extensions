import { type Action } from '@awell-health/extensions-core'
import { dataPoints, fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { validateActionFields } from './config/fields'

export const embeddedSigning: Action<typeof fields, typeof settings> = {
  key: 'embeddedSigning',
  title: 'Embedded signing',
  description:
    'Let a stakeholder sign an embedded signature request with Awell Hosted Pages.',
  category: Category.DOCUMENT_MANAGEMENT,
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
