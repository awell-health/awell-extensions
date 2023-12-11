import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './v1/actions'

export const nexuzhealth: Extension = {
  key: 'nexuzhealth',
  title: 'nexuzhealth',
  description:
    'Nexuzhealth develops KWS (Klinisch Werkstation), an EHR for hospitals, healthcare institutions, home nursing, and general practitioners.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1702299062/Awell%20Extensions/nexuzhealth.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
