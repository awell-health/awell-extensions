import { type CustomActionExtension } from '../../lib/types'
import { smsNotification } from './actions'
import { settings } from './settings'

export const Twilio: CustomActionExtension = {
  key: 'twilio',
  title: 'Twilio',
  category: 'Notifications',
  actions: {
    smsNotification,
  },
  settings,
}
