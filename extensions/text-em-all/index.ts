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
    'https://res.cloudinary.com/da7x4rzl4/image/upload/c_thumb,w_200,g_face/v1740592441/text-em-all-logo_ljty2t.png',
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
