import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const athenahealth: Extension = {
  key: 'athenahealth',
  title: 'athenahealth',
  description:
    'Athena offers medical groups, hospitals, and health systems cloud-based EHR, practice management, and patient engagement services that seamlessly connect care and drive results for every client.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1708088411/Awell%20Extensions/athenahealth.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
