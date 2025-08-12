import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const srfax: Extension = {
  key: 'srfax',
  title: 'SRFax',
  icon_url: 'https://www.srfax.com/images/logo.png',
  description: 'Retrieve faxes from SRFax and extract text using LandingAI OCR.',
  category: Category.DOCUMENT_MANAGEMENT,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
