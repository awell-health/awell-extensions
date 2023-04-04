import { actions } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { AuthorType, Category } from '../../lib/types/marketplace'
import { webhooks } from './webhooks'

export const Elation: Extension = {
  key: 'elation',
  title: 'Elation',
  description: 'An elation example.',
  icon_url:
    'https://www.multivu.com/players/English/8436251-elation-health-4c-medical-group-clinical-engagement-platform/image/ElationHealthlogo_1540425595855-HR.jpg',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
