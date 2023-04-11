import { type Patient } from './Patient'

export interface NewActivityPayload<
  SettingsKeys extends string | number | symbol = never,
  FieldsKeys extends string | number | symbol = never
> {
  activity: {
    id: string
  }
  patient: Patient
  fields: Record<FieldsKeys, string | undefined>
  settings: Record<SettingsKeys, string | undefined>
}
