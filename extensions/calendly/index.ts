import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const Calendly: Extension = {
  key: 'calendly',
  title: 'Calendly',
  icon_url:
    'https://ww2.freelogovectors.net/wp-content/uploads/2023/05/calendly_logo-freelogovectors.net_.png',
  description: 'Enable scheduling in your care flows with Calendly.',
  category: Category.SCHEDULING,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {},
  webhooks,
  settings,
}
