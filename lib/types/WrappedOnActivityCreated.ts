import type { Fields as FieldsType } from './Fields'
import type { Settings as SettingsType } from './Settings'
import type { Action } from './Action'

export type WrappedOnActivityCreated<
  AdditionalArgs extends unknown[],
  Fields extends FieldsType,
  Settings extends SettingsType,
  DPKeys extends string = string
> = (
  ...args: [
    ...Parameters<Action<Fields, Settings, DPKeys>['onActivityCreated']>,
    ...AdditionalArgs
  ]
) => Promise<void>
