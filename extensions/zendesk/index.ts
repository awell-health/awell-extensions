import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'
import { settings } from './settings'

export const Zendesk: Extension = {
  key: 'zendesk',
  title: 'Zendesk',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1697013804/Awell%20Extensions/ezgif.com-webp-to-png.png',
  description:
    'Zendesk is a customer service and support platform that provides a suite of tools and software for businesses to manage their customer interactions.',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
