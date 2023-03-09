import { type Extension } from '../../lib/types'
import { smsNotification } from './actions'
import { settings } from './settings'

export const Twilio: Extension = {
  key: 'twilio',
  title: 'Twilio',
  icon_url: 'https://www.vectorlogo.zone/logos/twilio/twilio-icon.svg',
  description: 'Send SMS messages to your care flow stakeholders.',
  category: 'Notifications',
  actions: {
    smsNotification,
  },
  settings,
}
