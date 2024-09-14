import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const hubspot: Extension = {
  key: 'hubspot',
  title: 'HubSpot',
  description:
    'HubSpot is a customer relationship management (CRM) platform that provides a suite of tools for marketing, sales, customer service, and content management.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726325417/Awell%20Extensions/168_Hubspot_logo_logos-512.webp',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
