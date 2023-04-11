import { type Extension } from '../../lib/types'
import { AuthorType, Category } from '../../lib/types/marketplace'
import { sendSms } from './v2/actions'
import { settings } from './settings'

export const Twilio: Extension = {
  key: 'twilio',
  title: 'Twilio',
  icon_url: 'https://www.vectorlogo.zone/logos/twilio/twilio-icon.svg',
  description: 'Add robust messaging capabilities to your care flow.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    sendSms,
  },
  settings,
}
