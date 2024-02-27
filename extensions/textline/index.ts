import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const Twilio: Extension = {
  key: 'textline',
  title: 'TextLine',
  icon_url:
    'https://pbs.twimg.com/profile_images/971752293841256450/OkNMApXr_400x400.jpg',
  description: 'Add robust messaging capabilities to your care flow.',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
