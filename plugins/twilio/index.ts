import { type ActivityPlugin } from '../../lib/types'
import { smsNotification } from './actions'
import { settings } from './settings'

export const Twilio: ActivityPlugin = {
  key: 'twilio',
  title: 'Twilio',
  category: 'Notifications',
  actions: {
    smsNotification,
  },
  settings,
}
