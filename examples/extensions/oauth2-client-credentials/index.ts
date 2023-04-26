import { hello } from './actions'
import { type Extension } from '../../../lib/types'
import { settings } from './settings'
import { webhooks } from './webhooks'
import { AuthorType, Category } from '../../../lib/types/marketplace'

export const HelloWorld: Extension = {
  key: 'oauth2-client-credentials-example',
  title: 'Client Credentials POC',
  description:
    'An example extension using an API client that uses OAuth2 (client credentials grant)',
  icon_url: 'https://avatars.githubusercontent.com/u/54594442?s=200&v=4',
  category: Category.DEMO,
  author: {
    authorType: AuthorType.AWELL,
  },
  settings,
  actions: {
    hello,
  },
  webhooks,
}
