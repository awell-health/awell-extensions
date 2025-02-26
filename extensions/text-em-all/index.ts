import {
  AuthorType,
  Category,
  type Extension,
} from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'
import { webhooks } from './webhooks'

export const TextEmAll: Extension = {
  key: 'text-em-all',
  category: Category.COMMUNICATION,
  title: 'Text-em-all',
  description: 'Send text messages to your patients.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1727996065/gridspace_inc_logo_yd4j7n.jpg',
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
