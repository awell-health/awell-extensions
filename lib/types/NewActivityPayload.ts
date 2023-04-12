import { type Patient } from './Patient'
import type { FieldType } from './Field'
import type { Fields as FieldsType } from './Fields'
import { type Settings as SettingsType } from './Settings'

type TypeValueMap =
  | {
      type: FieldType.BOOLEAN
      value?: boolean
    }
  | {
      type: FieldType.NUMERIC
      value?: number
    }
  | {
      type: FieldType.STRING
      value?: string
    }
  | {
      type: FieldType.HTML
      value?: string
    }
  | {
      type: FieldType.JSON
      value?: string
    }
  | {
      type: FieldType.TEXT
      value?: string
    }
  | {
      type: FieldType.DATE
      value?: string // ISO format
    }
// extract value for type
type FieldValueType<T extends FieldType> = Extract<
  TypeValueMap,
  { type: T }
>['value']

// map field to a field value type based of field type prop
type FieldValues<T extends FieldsType> = {
  [K in keyof T]: FieldValueType<T[K]['type']>
}

export interface NewActivityPayload<
  Fields extends FieldsType = never,
  Settings extends SettingsType = never
> {
  activity: {
    id: string
  }
  patient: Patient
  fields: FieldValues<Fields>
  settings: Record<keyof Settings, string | undefined>
}
