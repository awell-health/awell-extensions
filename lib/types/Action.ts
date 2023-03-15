import { type NewActivityPayload } from './NewActivityPayload'
import { type Field } from './Field'
import { type Setting } from './Setting'
import { type OnCompleteCallback } from './OnCompleteCallback'
import { type OnErrorCallback } from './OnErrorCallback'
import { type DataPointDefinition } from './DataPointDefinition'

export interface Action<
  Fields extends Record<string, Field>,
  Settings extends Record<string, Setting>,
  DPKeys extends string = string
> {
  key: string
  title: string
  description: string
  category: string
  iconUrl?: string
  dataPoints?: Record<DPKeys, DataPointDefinition>
  fields: Fields
  previewable?: boolean
  onActivityCreated: (
    payload: NewActivityPayload<keyof Settings, keyof Fields>,
    onComplete: OnCompleteCallback<DPKeys>,
    onError: OnErrorCallback
  ) => Promise<void>
}
