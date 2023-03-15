import { actions } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { webhooks } from './webhooks'
import { AuthorType, Category } from '../../lib/types/marketplace'

export const Healthie: Extension = {
  key: 'healthie',
  category: Category.INTEGRATIONS,
  title: 'Healthie',
  description: 'Connect to the Healthie API and receive webhooks',
  icon_url:
    'https://assets-global.website-files.com/5ff335a72af33d6ff0d8191f/6001d714ffd4c31ae0361055_healthie-logo-color.svg',
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
