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
    'Cerner EMR is an electronic medical records system that helps healthcare organizations improve patient care and increase efficiency.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1736327719/Awell%20Extensions/CERN-4c75d8aa.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
