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
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678908303/Awell%20Extensions/HealthieLogo.png',
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
