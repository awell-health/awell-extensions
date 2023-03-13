import { type Action } from './Action'
import { type Field } from './Field'
import { type Setting } from './Setting'
import { type Webhook } from './Webhook'

export interface Extension {
  key: string
  title: string
  category: string
  description?: string
  settings: Record<string, Setting>
  icon_url?: string
  actions: Record<
    string,
    Action<Record<string, Field>, Record<string, Setting>, string>
  >
  webhooks?: Array<Webhook<string, any>>
}
