import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'
import { settings } from './settings'

export const Iterable: Extension = {
  key: 'iterable',
  title: 'Iterable',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1696933028/Awell%20Extensions/logo_1668536435066.jpg',
  description:
    'Iterable is an email marketing automation platform that allows creating, sending, and tracking personalized email campaigns.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
