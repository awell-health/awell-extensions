import { type ExtensionAction } from './ExtensionAction'
import { type ExtensionActionField } from './ExtensionActionField'
import { type ExtensionSetting } from './ExtensionSetting'

export interface CustomActionExtension {
  key: string
  title: string
  category: string
  description?: string
  settings: Record<string, ExtensionSetting>
  actions: Record<
    string,
    ExtensionAction<
      Record<string, ExtensionActionField>,
      Record<string, ExtensionSetting>
    >
  >
}
