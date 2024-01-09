import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import {
  remoteSingleSelect
} from './v1/actions'
import { settings } from './settings'

export const CollectData: Extension = {
  key: 'collectData',
  title: 'Collect Data',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  description:
    'Collect data from users to ingest into care flows',
  category: Category.FORMS,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    remoteSingleSelect
  },
  settings,
}
