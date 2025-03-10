import { type NewActivityPayload } from '@awell-health/extensions-core'
import { type fields } from '../config'
import { type settings } from '../../../settings'

export const generatePayload = (
  prompt: string,
): NewActivityPayload<typeof fields, typeof settings> => ({
  fields: {
    patientId: 12345,
    prompt,
  },
  settings: {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
    rateLimitDuration: '',
  },
  pathway: {
    id: 'test-flow-id',
    definition_id: 'whatever',
    tenant_id: '123',
    org_slug: 'test-org-slug',
    org_id: 'test-org-id',
  },
  activity: {
    id: 'test-activity-id',
  },
  patient: {
    id: 'test-patient-id',
  },
})
