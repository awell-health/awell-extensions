import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { sendEmail, sendEmailWithTemplate } from './v1/actions'
import { settings } from './settings'

export const Mailchimp: Extension = {
  key: 'mailchimp',
  title: 'Mailchimp',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1681285075/Awell%20Extensions/Mailchimp-Logo.png',
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
