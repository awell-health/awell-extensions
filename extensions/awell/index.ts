import { actions } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { webhooks } from './webhooks'
import { AuthorType, Category } from '../../lib/types/marketplace'

export const Awell: Extension = {
  key: 'awell',
  title: 'Awell Workflow',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  description: 'Enrich your care flows with powerful Awell actions.',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
