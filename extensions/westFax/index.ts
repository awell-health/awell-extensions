import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const WestFax: Extension = {
  key: 'westFax',
  category: Category.COMMUNICATION,
  title: 'WestFax',
  description: 'Send secure and HIPAA compliant faxes with WestFax.',
  icon_url:
    'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_7dc2e23dc9bbc80068bbfde536ac5451/westfax.png',
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
