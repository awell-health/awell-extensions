import { type Extension } from '../../lib/types'
import { bookAppointment,  } from './actions'
import { settings } from './settings'

export const CalDotCom: Extension = {
  key: 'calDotCom',
  title: 'Cal.com',
  icon_url: 'https://cal.com/logo.svg',
  description: 'Enable scheduling in your care flows with Cal.com.',
  category: 'Scheduling',
  actions: {
    bookAppointment,
  },
  settings,
}
