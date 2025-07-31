import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const stedi: Extension = {
  key: 'stedi',
  title: 'Stedi',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1753954684/Awell%20Extensions/skaoypelxrnkigpymjye.webp',
  description:
    'Automate healthcare transactions like real-time eligibility checks and claims processing with APIs that support thousands of payers.',
  category: Category.BILLING,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
