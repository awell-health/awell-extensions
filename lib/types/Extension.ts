import { type Action } from './Action'
import { type Category, type Author } from './marketplace'
import { type Settings } from './Settings'
import { type Webhook } from './Webhook'

export interface Extension {
  key: string
  title: string
  category: Category
  description: string
  settings: Settings
  icon_url: string
  author: Author
  actions: Record<string, Action<any, Settings, string, any>> // any used here because we use much more narrower type in Action payload
  webhooks?: Array<Webhook<string, any>>
}
