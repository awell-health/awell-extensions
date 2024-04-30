import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import * as actions from './actions'
import { settings } from './settings'

export const Medplum: Extension = {
  key: 'medplum',
  title: 'Medplum',
  description:
    'Medplum is the open source healthcare developer platform that helps you build, test, and deliver any healthcare product or service.',
  icon_url: 'https://www.medplum.com/img/logo.svg',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
