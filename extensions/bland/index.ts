import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const bland: Extension = {
  key: 'bland',
  title: 'Bland.ai',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1731027387/Awell%20Extensions/Bland-AI.jpg',
  description: 'Automate your phone calls with AI',
  category: Category.COMMUNICATION,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
