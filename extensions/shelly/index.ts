import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const shelly: Extension = {
  key: 'shelly',
  title: 'Shelly (experimental)',
  description: 'Library of AI-powered actions',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/imgage/upload/v1726037275/Awell%20Extensions/shelly_logo.png',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
