import { type Extension } from '@awell-health/awell-extensions-types'
import { AuthorType, Category } from '@awell-health/awell-extensions-types'
import { sendEmail, sendEmailWithTemplate } from './v1/actions'
import { settings } from './settings'

export const Mailgun: Extension = {
  key: 'mailgun',
  title: 'Mailgun',
  icon_url:
    'https://cdn.freebiesupply.com/logos/large/2x/mailgun-logo-png-transparent.png',
  description:
    'Mailgun is a cloud-based email service provider that allows for sending transactional emails.',
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
