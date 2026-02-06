import { webhooks } from './webhooks'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'

export const Documo: Extension = {
  key: 'documo',
  title: 'Documo',
  description: 'Documo extension for Awell',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1766186926/Awell%20Extensions/documo_logo.png',
  category: Category.DEMO,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
  webhooks,
}
