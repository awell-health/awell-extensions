import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const Braze: Extension = {
  key: 'braze',
  title: 'Braze',
  description:
    'Braze is a customer engagement platform that helps you communicate with your patients.',
  icon_url: '',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks: [],
}
