import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import {
  bookAppointment,
  getBooking,
  updateBooking,
  deleteBooking,
  createBooking,
  getBookingv2,
} from './actions'
import { settings } from './settings'
import { webhooks } from './webhooks'

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
    getBooking,
    updateBooking,
    deleteBooking,
    createBooking,
    getBookingv2,
  },
  webhooks,
  settings,
}
