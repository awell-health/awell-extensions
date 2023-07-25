import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { settings } from './settings'

export const TalkDesk: Extension = {
  key: 'talkDesk',
  title: 'TalkDesk',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1689344292/Awell%20Extensions/talkdesk_logo.jpg',
  description:
    'Talkdesk is a cloud-based customer experience and contact center software company.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {},
  settings,
}
