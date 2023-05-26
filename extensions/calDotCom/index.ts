import { type Extension } from '@awell-health/awell-extensions-types'
import { AuthorType, Category } from '@awell-health/awell-extensions-types'
import { bookAppointment, getBooking } from './actions'
import { settings } from './settings'

export const CalDotCom: Extension = {
  key: 'calDotCom',
  title: 'Cal.com',
  icon_url: 'https://cal.com/logo.svg',
  description: 'Enable scheduling in your care flows with Cal.com.',
  category: Category.SCHEDULING,
  author: {
    authorType: AuthorType.HTD,
  },
  actions: {
    bookAppointment,
    getBooking
  },
  settings,
}
