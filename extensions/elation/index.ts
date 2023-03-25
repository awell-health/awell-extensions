import { getPatient } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { AuthorType, Category } from '../../lib/types/marketplace'

export const Elation: Extension = {
  key: 'elation',
  title: 'Elation',
  description: 'An elation example.',
  icon_url:
    'https://www.elationhealth.com/wp-content/themes/elation2021/assets/images/elation-health-logo-blue.svg',
  category: Category.INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    getPatient,
  },
}
