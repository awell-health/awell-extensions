import type { Fields as FieldsType } from './Fields'
import type { Settings as SettingsType } from './Settings'
import type { NewActivityPayload } from './NewActivityPayload'
import type { OnCompleteCallback } from './OnCompleteCallback'
import type { OnErrorCallback } from './OnErrorCallback'
import type { CacheService } from '../../src/cache/cache'

export type ActivityWrapperInjector<AdditionalArgs extends unknown[]> = <
  Fields extends FieldsType,
  Settings extends SettingsType,
  DPKeys extends string = string
>(
  payload: NewActivityPayload<Fields, Settings>,
  onComplete: OnCompleteCallback<DPKeys>,
  onError: OnErrorCallback,
  options: { authCacheService?: CacheService<string> }
) => AdditionalArgs
