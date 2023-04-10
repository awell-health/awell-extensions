import { type Patient } from './Patient'
import type { Field, FieldType } from './Field'
import type { Fields as FieldsType } from './Fields'
import { type Settings as SettingsType } from './Settings'

// extract value from Field for type
type FieldValueType<T extends FieldType> = Extract<Field, { type: T }>['value']

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
