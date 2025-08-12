import { actions } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const srfax: Extension = {
  key: 'srfax',
  title: 'SRFax',
  icon_url: 'https://res.cloudinary.com/dbhuqasw0/image/upload/v1754994599/1545794_648668791846553_275530089_n-300x300_gq9m32.jpg',
  description: 'Retrieve faxes from SRFax and extract text using LandingAI OCR.',
  category: Category.DOCUMENT_MANAGEMENT,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
