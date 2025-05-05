import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const customerIo: Extension = {
  key: 'customerIo',
  title: 'Customer.io',
  description:
    'Customer.io is a customer engagement platform designed to create personalized customer journeys that engage, convert, and scale.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1746447967/Awell%20Extensions/favicon.svg',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
