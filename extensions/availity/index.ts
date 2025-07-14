import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const availity: Extension = {
  key: 'availity',
  title: 'Availity',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1752487435/Awell%20Extensions/availity.png',
  description:
    "Availity's two-sided network allows payers and providers to share accurate, up-to-date information earlier in the healthcare lifecycle.",
  category: Category.BILLING,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
