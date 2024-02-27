import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import actions from './actions'

export const icd: Extension = {
  key: 'icd',
  title: 'An ICD extension!',
  description:
    'An example extension developers can look at to get started with building their first extension.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  category: Category.DATA,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings: {},
  actions,
}
