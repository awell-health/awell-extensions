import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const TextLine: Extension = {
  key: 'textline',
  title: 'TextLine',
  icon_url:
    'https://pbs.twimg.com/profile_images/971752293841256450/OkNMApXr_400x400.jpg',
  description: 'Textline's business texting software offers solutions for sales, marketing, customer service, and beyond. Utilize the power of SMS to grow quickly.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
