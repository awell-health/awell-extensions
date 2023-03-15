import { type Action } from './Action'
import { type Field } from './Field'
import { type Category, type Author } from './marketplace'
import { type Setting } from './Setting'
import { type Webhook } from './Webhook'

export interface Extension {
  key: string
  title: string
  category: Category
  description: string
  settings: Record<string, Setting>
  iconUrl: string
  author: Author
  actions: Record<
    string,
    Action<Record<string, Field>, Record<string, Setting>, string>
  >
  webhooks?: Array<Webhook<string, any>>
}
