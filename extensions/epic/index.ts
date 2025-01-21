import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const epic: Extension = {
  key: 'epic',
  title: 'Epic',
  description:
    'Epic is an Electronic Health Records (EHR) system for healthcare organizations, hospitals and large practices.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1736327686/Awell%20Extensions/epiclogo_2_1.webp',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
