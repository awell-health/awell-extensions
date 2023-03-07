import { type Action } from './Action'
import { type Field } from './Field'
import { type Setting } from './Setting'

export interface Extension {
  key: string
  title: string
  category: string
  description?: string
  settings: Record<string, Setting>
  actions: Record<
    string,
    Action<
      Record<string, Field>,
      Record<string, Setting>
    >
  >
}
