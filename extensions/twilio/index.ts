import { type Extension } from '../../lib/types'
import { smsNotification } from './actions'
import { settings } from './settings'

export const Twilio: Extension = {
  key: 'twilio',
  title: 'Twilio',
  category: 'Notifications',
  actions: {
    smsNotification,
  },
  settings,
}
