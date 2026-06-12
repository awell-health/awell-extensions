import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const hix: Extension = {
  key: 'hix',
  title: 'ChipSoft HiX',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  description:
    'Integratie met ChipSoft HiX: creëer taken op de werklijst van de zorgverlener.',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
