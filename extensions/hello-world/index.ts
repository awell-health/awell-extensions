import { log, logTwo } from './actions'
import { type Extension } from '@awell-health/extensions-core'
import { settings } from './settings'
import { webhooks } from './webhooks'
import { AuthorType, Category } from '@awell-health/extensions-core'

export const HelloWorld: Extension = {
  key: 'hello-world',
  title: 'Hello World !',
  description:
    'An example extension developers can look at to get started with building their first extension.',
  icon_url:
    'https://res.cloudinary.com/da7x4rzl4/image/upload/v1678870116/Awell%20Extensions/Awell_Logo.png',
  category: Category.DEMO,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    log,
    logTwo,
  },
  webhooks,
}
