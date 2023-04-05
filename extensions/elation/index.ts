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
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1680683235/Awell%20Extensions/elation_favicon.png',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
