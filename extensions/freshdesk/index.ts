import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const freshdesk: Extension = {
  key: 'freshdesk',
  title: 'Freshdesk',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1751905938/Awell%20Extensions/png-clipart-freshdesk-logo-icon-tech-companies.png',
  description:
    'Freshdesk is a cloud-based customer service software that helps businesses manage and streamline their customer support operations.',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
  webhooks,
}
