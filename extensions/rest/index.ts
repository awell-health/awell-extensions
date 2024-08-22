import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const rest: Extension = {
  key: 'rest',
  title: 'REST',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1724322431/Awell%20Extensions/REST_socialmedia.webp',
  description:
    'A utility extension with more advanced options to make REST API calls',
  category: Category.DATA,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
