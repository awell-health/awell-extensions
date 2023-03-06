import { type NewActivityPayload } from './NewActivityPayload'
import { type ExtensionActionField } from './ExtensionActionField'
import { type ExtensionSetting } from './ExtensionSetting'

export interface ExtensionAction<
  Fields extends Record<string, ExtensionActionField>,
  Settings extends Record<string, ExtensionSetting>
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
