import {
  type Extension,
  Category,
  AuthorType,
} from '@awell-health/extensions-core'
import actions from './actions'
import { settings } from './settings'

export const dockHealth: Extension = {
  key: 'dockHealth',
  title: 'Dock Health',
  description:
    'HIPAA-compliant task management and workflow automation for healthcare. Assign, track, automate, and complete administrative to-do lists.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1714717332/Awell%20Extensions/images.png',
  category: Category.WORKFLOW,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions,
}
