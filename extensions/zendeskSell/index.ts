import { type Extension, AuthorType, Category } from '@awell-health/extensions-core'
import { settings } from './settings'
import * as actions from './v1/actions'

export const ZendeskSell: Extension = {
  key: 'zendeskSell',
  title: 'Zendesk Sell',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1697013804/Awell%20Extensions/ezgif.com-webp-to-png.png',
  description:
    'Zendesk Sell is a sales CRM platform focused on enhancing productivity and pipeline visibility.',
  category: Category.CUSTOMER_SUPPORT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
