import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'
import { settings } from './settings'

export const Zendesk: Extension = {
  key: 'zendesk',
  title: 'Zendesk Support',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1697013804/Awell%20Extensions/zendesk-icon.png',
  description:
    'Zendesk Support is a customer service platform that provides ticketing, knowledge base, and customer communication tools.',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
