import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const dateHelpers: Extension = {
  key: 'dateHelpers',
  title: 'Date Helpers',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1744914452/Awell%20Extensions/date_helpers.png',
  description:
    'A set of utility actions to help with common and useful date and time operations.',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
