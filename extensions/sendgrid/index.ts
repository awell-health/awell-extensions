import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import {
  sendEmail,
  sendEmailWithTemplate,
  addOrUpdateContact,
} from './v1/actions'
import { settings } from './settings'

export const Sendgrid: Extension = {
  key: 'sendgrid',
  title: 'Sendgrid',
  icon_url: 'https://www.vectorlogo.zone/logos/sendgrid/sendgrid-icon.svg',
  description:
    'From design to deliverability, raise the bar across all email you send with Marketing Campaigns.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    sendEmail,
    sendEmailWithTemplate,
    addOrUpdateContact,
  },
  settings,
}
