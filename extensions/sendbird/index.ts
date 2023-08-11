import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'
import { settings } from './settings'

export const Sendbird: Extension = {
  key: 'sendbird',
  title: 'Sendbird',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1690880046/Awell%20Extensions/1688588894238.jpg',
  description: 'Sendbird is a cloud-based chat and messaging platform.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
