import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const Elation: Extension = {
  key: 'canvasMedical',
  title: 'Canvas Medical',
  description: 'Canvas Medical is an EHR that is FHIR compliant',
  // TODO replace this with actual CM icon
  icon_url: 'icon',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
