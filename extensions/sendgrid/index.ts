import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { emailNotification, emailNotificationWithTemplate } from './actions'
import { AuthorType, Category } from '../../lib/types/marketplace'

export const Sendgrid: Extension = {
  key: 'sendgrid',
  title: 'Sendgrid',
  icon_url: 'https://www.vectorlogo.zone/logos/sendgrid/sendgrid-icon.svg',
  description:
    'Use Sendgrid as your notification provider to send notifications to stakeholders in your care flow.',
  category: Category.COMMUNICATION,
  actions: {
    emailNotification,
    emailNotificationWithTemplate,
  },
  settings,
  author: {
    authorType: AuthorType.AWELL,
  },
}
