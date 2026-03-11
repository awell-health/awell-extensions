import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const GuidewayCare: Extension = {
  key: 'guidewayCare',
  title: 'Guideway Care',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1751905938/Awell%20Extensions/guideway-care-logo.png',
  description:
    'AI-powered patient observation summarization from call transcripts and interaction text',
  category: Category.AI,
  author: {
    authorType: AuthorType.EXTERNAL,
    authorName: 'Guideway Care',
  },
  actions,
  settings,
}
