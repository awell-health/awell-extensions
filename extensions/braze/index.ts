import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const Braze: Extension = {
  key: 'braze',
  title: 'Braze',
  description:
    'Braze is a customer engagement platform that helps you communicate with your patients.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/c_thumb,w_200,g_face/v1740686243/brazeLogo_laecb9.jpg',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks: [],
}
