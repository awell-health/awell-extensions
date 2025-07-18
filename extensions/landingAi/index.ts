import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const landingAi: Extension = {
  key: 'landingAi',
  title: 'Landing.ai',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1752834756/Awell%20Extensions/34525670.png',
  description:
    'Turn your documents and images into visual intelligence. LandingAI’s cutting-edge software platform makes computer vision easy for a wide range of applications across all industries.',
  category: Category.DOCUMENT_MANAGEMENT,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
