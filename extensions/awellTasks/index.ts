import { type Extension } from '@awell-health/extensions-core'
import { AuthorType, Category } from '@awell-health/extensions-core'
import { actions } from './actions'
import { settings } from './settings'

export const awellTasks: Extension = {
  key: 'awellTasks',
  title: 'Awell Tasks',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1736765692/Awell%20Extensions/AwellTasks.png',
  description: 'Connect to Awell Tasks',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  actions,
  settings,
}
