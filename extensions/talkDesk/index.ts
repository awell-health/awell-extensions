import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { settings } from './settings'

export const TalkDesk: Extension = {
  key: 'talkDesk',
  title: 'TalkDesk',
  icon_url:
    'https://prd-cdn-talkdesk.talkdesk.com/cdn-assets/latest/talkdesk/brand/main_brand/logo/talkdesk_logo_purple.svg',
  description:
    'Talkdesk is a cloud-based customer experience and contact center software company.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {},
  settings,
}
