import { type Extension } from '../../lib/types'
import { AuthorType, Category } from '../../lib/types/marketplace'
import { sendEmail, sendEmailWithTemplate } from './v1/actions'
import { settings } from './settings'

export const Mailchimp: Extension = {
  key: 'mailchimp',
  title: 'Mailchimp',
  icon_url: 'https://assets.stickpng.com/images/62a2148e443b787d5837123e.png',
  description:
    'Mailchimp is an all-in-one marketing platform that helps businesses to design, send, and manage email campaigns.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    sendEmail,
    sendEmailWithTemplate,
  },
  settings,
}
