import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const DrChrono: Extension = {
  key: 'drChrono',
  title: 'DrChrono',
  description:
    'DrChrono is a company that provides a comprehensive electronic health record (EHR) platform and medical practice management software.',
  icon_url:
    'https://www.drchrono.com/site_media/images/logos/drchrono-black-wpadding.png',
  category: Category.EHR_INTEGRATIONS,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
