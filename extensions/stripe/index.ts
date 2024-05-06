import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const stripe: Extension = {
  key: 'stripe',
  title: 'Stripe (alpha)',
  description:
    'Stripe powers online and in-person payment processing and financial solutions for businesses of all sizes.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1715008389/Awell%20Extensions/images_1.png',
  category: Category.BILLING,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
