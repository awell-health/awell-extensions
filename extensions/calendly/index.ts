import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const Calendly: Extension = {
  key: 'calendly',
  title: 'Calendly',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1773330172/calendly-logo_mtaoa1.png',
  description:
    '** In beta ** Enable scheduling in your care flows with Calendly.',
  category: Category.SCHEDULING,
  author: {
    authorType: AuthorType.EXTERNAL,
    authorName: 'Rajeev Gade',
  },
  actions: {},
  webhooks,
  settings,
}
