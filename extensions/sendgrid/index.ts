import { type Extension } from '../../lib/types'
import { settings } from './settings'
import {
  emailNotification,
  emailNotificationWithTemplate,
  patientEmailNotification,
  patientEmailNotificationWithTemplate,
} from './actions'

export const Sendgrid: Extension = {
  key: 'sendgrid',
  title: 'Sendgrid',
  icon_url: 'https://www.vectorlogo.zone/logos/sendgrid/sendgrid-icon.svg',
  description:
    'Use Sendgrid as your notification provider to send notifications to stakeholders in your care flow.',
  category: 'Communication',
  actions: {
    emailNotification,
    emailNotificationWithTemplate,
    patientEmailNotification,
    patientEmailNotificationWithTemplate,
  },
  settings,
}
