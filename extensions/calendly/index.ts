import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const Calendly: Extension = {
  key: 'calendly',
  title: 'Calendly',
  icon_url:
    'https://asset.cloudinary.com/da7x4rzl4/e3feb49a5ef3ccd2951bf93aea0a1552',
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
