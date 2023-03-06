import { type ActionExtension } from '../../lib/types'
import { smsNotification } from './actions'
import { settings } from './settings'

export const Twilio: ActionExtension = {
  key: 'twilio',
  title: 'Twilio',
  category: 'Notifications',
  actions: {
    smsNotification,
  },
  settings,
}
