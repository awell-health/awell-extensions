import type { Fields as FieldsType } from './Fields'
import type { Settings as SettingsType } from './Settings'
import type { ActionWithServices, RequiredServices } from './Action'

export type WrappedOnActivityCreated<
  AdditionalArgs extends unknown[],
  Fields extends FieldsType,
  Settings extends SettingsType,
  DPKeys extends string,
  Services extends RequiredServices
> = (
  ...args: [
    ...Parameters<
      ActionWithServices<
        Fields,
        Settings,
        Services,
        DPKeys
      >['onActivityCreated']
    >,
    ...AdditionalArgs
  ]
) => Promise<void>
