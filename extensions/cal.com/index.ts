import { type Extension } from '../../lib/types'
import { AuthorType, Category } from '../../lib/types/marketplace'
import { bookAppointment } from './actions'
import { settings } from './settings'

export const CalDotCom: Extension = {
  key: 'calDotCom',
  title: 'Cal.com',
  iconUrl: 'https://cal.com/logo.svg',
  description: 'Enable scheduling in your care flows with Cal.com.',
  category: Category.SCHEDULING,
  author: {
    authorType: AuthorType.HTD,
  },
  actions: {
    bookAppointment,
  },
  settings,
}
