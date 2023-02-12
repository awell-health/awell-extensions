import { type PluginAction } from './PluginAction'
import { type PluginActionField } from './PluginActionField'
import { type PluginSetting } from './PluginSetting'

export interface ActivityPlugin {
  key: string
  title: string
  category: string
  description?: string
  settings: Record<string, PluginSetting>
  actions: Record<
    string,
    PluginAction<
      Record<string, PluginActionField>,
      Record<string, PluginSetting>
    >
  >
}
