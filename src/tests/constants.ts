import { type NewActivityPayload } from '@awell-health/extensions-core'

export const testPayload: NewActivityPayload<any, any> = {
  pathway: {
    id: 'pathway-id',
    definition_id: 'pathway-definition-id',
  },
  activity: {
    id: 'activity-id',
    sessionId: 'session-id',
  },
  patient: {
    id: 'test-patient',
    profile: {
      first_name: 'Nick',
      last_name: 'Hellemans',
      birth_date: '1993-11-30',
    },
  },
  fields: {},
  settings: {},
}

export const generateTestPayload = <
  Fields extends Record<string, string | number | boolean | undefined>,
  Settings extends Record<string, string | undefined>
>({
  fields,
  settings,
}: {
  fields: Fields
  settings: Settings
}): Omit<NewActivityPayload, 'fields' | 'settings'> & {
  fields: Fields
  settings: Settings
} => ({
  ...testPayload,
  fields,
  settings,
})
