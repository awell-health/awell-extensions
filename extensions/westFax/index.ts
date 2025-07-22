import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { webhooks } from './webhooks'

export const WestFax: Extension = {
  key: 'westFax',
  category: Category.COMMUNICATION,
  title: 'WestFax',
  description:
    'Send faxes securely and in compliance with HIPAA regulations using WestFax.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1707739199/Awell%20Extensions/Screenshot_2024-02-12_at_12.59.08.png',
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
