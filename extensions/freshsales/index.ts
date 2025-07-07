import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const freshsales: Extension = {
  key: 'freshsales',
  title: 'Freshsales',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1751917615/Awell%20Extensions/freshsales.png',
  description:
    'Freshsales is a cloud-based, AI-powered customer relationship management (CRM) software designed to help sales teams organize, manage, and close deals more efficiently.',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
