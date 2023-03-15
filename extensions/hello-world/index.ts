import { log } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'
import { webhooks } from './webhooks'
import { AuthorType, Category } from '../../lib/types/marketplace'

export const HelloWorld: Extension = {
  key: 'hello-world',
  title: 'Hello World !',
  description:
    'An example extension developers can look at to get started with building their first extension.',
  iconUrl:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  category: Category.DEMO,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    log,
  },
  webhooks,
}
