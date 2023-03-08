export interface NewActivityPayload<
  SettingsKeys extends string | number | symbol = never,
  FieldsKeys extends string | number | symbol = never
> {
  activity: {
    id: string
  }
  patient: {
    id: string
    profile?: {
      email?: string
      first_name?: string
      last_name?: string
      name?: string
      phone?: string
      mobile_phone?: string
      patient_code?: string
      sex?: 'MALE' | 'FEMALE' | 'NOT_KNOWN'
    }
  }
  fields: Record<FieldsKeys, string | undefined>
  settings: Record<SettingsKeys, string | undefined>
}
