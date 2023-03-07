import { type NewActivityPayload } from './NewActivityPayload'
import { type Field } from './Field'
import { type Setting } from './Setting'

export interface Action<
  Fields extends Record<string, Field>,
  Settings extends Record<string, Setting>
> {
  key: string
  title: string
  category: string
  icon?: string
  description?: string
  options?: Record<string, any>
  fields: Fields
  previewable?: boolean
  onActivityCreated: (
    payload: NewActivityPayload<keyof Settings, keyof Fields>,
    done: () => Promise<void>
  ) => Promise<void>
}
