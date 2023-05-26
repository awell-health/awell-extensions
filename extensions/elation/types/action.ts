import type {
  Action,
  Fields as FieldsType,
} from '@awell-health/awell-extensions-types'
import type { settings } from '../settings'

export type ElationAction<
  Fields extends FieldsType,
  DPKeys extends string = string
> = Action<Fields, typeof settings, DPKeys>
