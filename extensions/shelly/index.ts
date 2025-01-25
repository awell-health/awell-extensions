import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'

export const shelly: Extension = {
  key: 'shelly',
  title: 'Shelly (Beta)',
  description: 'Library of AI-powered actions',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726037275/Awell%20Extensions/shelly_logo.png',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings: {},
  actions,
}
