import { type Extension } from '../../lib/types'
import { AuthorType, Category } from '../../lib/types/marketplace'
import { generatePatientSummary } from './v1/actions'
import { settings } from './settings'

export const AvaAi: Extension = {
  key: 'avaAi',
  title: 'Ava - Awell Virtual (AI) Assistant',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1681032937/Awell%20Extensions/Avatar.png',
  description: `Ava is "Awell's Virtual (AI) Assistant that can help you automate simple tasks in your care flow.`,
  category: Category.AI,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions: {
    generatePatientSummary,
  },
  settings,
}
