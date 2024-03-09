import { requestVideoVisit, enterMedication } from './v1/actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const Experimental: Extension = {
  key: 'experimental',
  title: 'Experimental extension',
  icon_url: 'https://cdn-icons-png.flaticon.com/512/3830/3830179.png',
  description: 'Extension for experimental purposes',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    requestVideoVisit,
    enterMedication,
  },
}
