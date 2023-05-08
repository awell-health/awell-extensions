import { type NewActivityPayload } from './NewActivityPayload'
import type { Fields as FieldsType } from './Fields'
import { type Settings as SettingsType } from './Settings'
import { type OnCompleteCallback } from './OnCompleteCallback'
import { type OnErrorCallback } from './OnErrorCallback'
import { type DataPointDefinition } from './DataPointDefinition'
import { type Category } from './marketplace'
import { type Services } from '../../src/services'

export type RequiredServices = ReadonlyArray<keyof Services>

type UnionOf<T extends RequiredServices | undefined> = {
  [N in keyof T]: T[N]
}[keyof T & number]
export type PickedServices<T extends RequiredServices | undefined> = Pick<
  Services,
  UnionOf<T> & keyof Services
>

interface CommonActionProps<
  Fields extends FieldsType,
  DPKeys extends string = string
> {
  key: string
  title: string
  description: string
  category: Category
  dataPoints?: Record<DPKeys, DataPointDefinition>
  fields: Fields
  previewable?: boolean
  // @Deprecated. Don't use unless you absolutely have to
  options?: {
    stakeholders?: {
      label: string
      mode: 'single'
    }
  }
}

export interface ActionWithoutServices<
  Fields extends FieldsType,
  Settings extends SettingsType,
  DPKeys extends string = string
> extends CommonActionProps<Fields, DPKeys> {
  onActivityCreated: (
    payload: NewActivityPayload<Fields, Settings>,
    onComplete: OnCompleteCallback<DPKeys>,
    onError: OnErrorCallback
  ) => Promise<void>
}

export interface ActionWithServices<
  Fields extends FieldsType,
  Settings extends SettingsType,
  Services extends RequiredServices,
  DPKeys extends string = string
> extends CommonActionProps<Fields, DPKeys> {
  services: Services
  onActivityCreated: (
    payload: NewActivityPayload<Fields, Settings>,
    onComplete: OnCompleteCallback<DPKeys>,
    onError: OnErrorCallback,
    services: PickedServices<Services>
  ) => Promise<void>
}

export type Action<
  Fields extends FieldsType,
  Settings extends SettingsType,
  DPKeys extends string = string,
  Services extends RequiredServices | undefined = undefined
> = Services extends undefined
  ? ActionWithoutServices<Fields, Settings, DPKeys>
  : ActionWithServices<Fields, Settings, Services & RequiredServices, DPKeys>
