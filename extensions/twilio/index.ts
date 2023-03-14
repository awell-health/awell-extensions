import { type Extension } from '../../lib/types'
import { smsNotification, patientSmsNotification } from './actions'
import { settings } from './settings'

export const Twilio: Extension = {
  key: 'twilio',
  title: 'Twilio',
  icon_url: 'https://www.vectorlogo.zone/logos/twilio/twilio-icon.svg',
  description: 'Add robust messaging capabilities to your care flow.',
  category: 'Communication',
  actions: {
    smsNotification,
    patientSmsNotification,
  },
  settings,
}
