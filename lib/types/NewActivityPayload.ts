import { type Patient } from './Patient'
import type { Field, FieldType } from './Field'
import type { Fields as FieldsType } from './Fields'
import { type Settings as SettingsType } from './Settings'

// extract value from Field for type
type FieldValue<T extends FieldType> = Extract<Field, { type: T }>['value']

// map field to a field value type based of field type prop
type TypedFields<T extends FieldsType> = {
  [K in keyof T]: FieldValue<T[K]['type']>
}

export interface NewActivityPayload<
  Settings extends SettingsType = never,
  Fields extends FieldsType = never
> {
  activity: {
    id: string
  }
  patient: Patient
  fields: TypedFields<Fields>
  settings: Record<keyof Settings, string | undefined>
}
