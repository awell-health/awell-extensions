import { type NewActivityPayload } from './NewActivityPayload'
import type { Fields as FieldsType } from './Fields'
import { type Settings as SettingsType } from './Settings'
import { type OnCompleteCallback } from './OnCompleteCallback'
import { type OnErrorCallback } from './OnErrorCallback'
import { type DataPointDefinition } from './DataPointDefinition'
import { type Category } from './marketplace'

export interface Action<
  Fields extends FieldsType,
  Settings extends SettingsType,
  DPKeys extends string = string
> {
  key: string
  title: string
  description: string
  category: Category
  dataPoints?: Record<DPKeys, DataPointDefinition>
  fields: Fields
  previewable?: boolean
  onActivityCreated: (
    payload: NewActivityPayload<Fields, Settings>,
    onComplete: OnCompleteCallback<DPKeys>,
    onError: OnErrorCallback
  ) => Promise<void>
  // @Deprecated. Don't use unless you absolutely have to
  options?: {
    stakeholders?: {
      label: string
      mode: 'single'
    }
  }
}
