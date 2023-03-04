import { type NewActivityPayload } from './NewActivityPayload'
import { type PluginActionField } from './PluginActionField'
import { type PluginSetting } from './PluginSetting'

export interface PluginAction<
  Fields extends Record<string, PluginActionField>,
  Settings extends Record<string, PluginSetting>
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
