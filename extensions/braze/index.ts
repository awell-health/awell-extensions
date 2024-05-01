import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const Braze: Extension = {
  key: 'braze',
  category: Category.COMMUNICATION,
  title: 'Braze',
  description:
    '** In beta ** Send messages to your patient via various communication channels by using Braze.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1714502941/logo-braze_v5erfe.svg',
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
