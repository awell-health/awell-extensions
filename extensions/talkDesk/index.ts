import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import { settings } from './settings'
import actions from './actions'

export const TalkDesk: Extension = {
  key: 'talkDesk',
  title: 'Talkdesk',
  description:
    'Talkdesk is a cloud-based customer experience and contact center software company.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1689344292/Awell%20Extensions/talkdesk_logo.jpg',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
