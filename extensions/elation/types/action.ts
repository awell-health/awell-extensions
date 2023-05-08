import type { Action, Fields as FieldsType } from '../../../lib/types'
import type { settings } from '../settings'

export type ElationAction<
  Fields extends FieldsType,
  DPKeys extends string = string
> = Action<Fields, typeof settings, DPKeys, ['authCacheService']>
