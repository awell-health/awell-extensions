import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { collectMedication, remoteSingleSelect, arrayTest } from './v1/actions'
import { settings } from './settings'

export const CollectData: Extension = {
  key: 'collectData',
  title: 'Advanced data collection',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  description:
    'This extension allows you to collect data from your users using a variety of advanced input types and data sources.',
  category: Category.FORMS,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    collectMedication,
    remoteSingleSelect,
    arrayTest,
  },
  settings,
}
