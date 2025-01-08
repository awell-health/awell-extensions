import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const cerner: Extension = {
  key: 'cerner',
  title: 'Cerner',
  description:
    'Cerner EHR is a cloud-based healthcare IT solution used to streamline clinical, administrative, and financial workflows by practices of all sizes.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1736327719/Awell%20Extensions/CERN-4c75d8aa.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
