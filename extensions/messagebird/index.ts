import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { sendWhatsAppMessage, sendSms, sendVoiceMessage } from './v1/actions'
import { settings } from './settings'

export const MessageBird: Extension = {
  key: 'messagebird',
  title: 'MessageBird',
  icon_url: 'https://developers.messagebird.com/img/glyph.svg',
  description:
    'MessageBird is a cloud-based communication platform with support for a variety of channels including WhatsApp, voice, live chat and more.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    sendSms,
    sendWhatsAppMessage,
    sendVoiceMessage,
  },
  settings,
}
