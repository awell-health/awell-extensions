import { type NewActivityPayload } from '@awell-health/extensions-core'

const BASE: NewActivityPayload<any, any> = {
  pathway: {
    id: 'pathway-id',
    definition_id: 'pathway-definition-id',
    tenant_id: 'tenant-id',
    org_slug: 'org-slug',
    org_id: 'org-id',
  },
  activity: {
    id: 'activity-id',
    sessionId: 'session-id',
  },
  patient: {
    id: 'test-patient',
  },
  fields: {},
  settings: {},
}

interface Overrides {
  fields?: Record<string, unknown>
  settings?: Record<string, string | undefined>
  patientId?: string
  pathwayId?: string
  activityId?: string
}

export const buildPayload = (
  overrides: Overrides,
): NewActivityPayload<any, any> => ({
  ...BASE,
  pathway: {
    ...BASE.pathway,
    ...(overrides.pathwayId !== undefined ? { id: overrides.pathwayId } : {}),
  },
  activity: {
    ...BASE.activity,
    ...(overrides.activityId !== undefined ? { id: overrides.activityId } : {}),
  },
  patient: {
    ...BASE.patient,
    ...(overrides.patientId !== undefined ? { id: overrides.patientId } : {}),
  },
  fields: overrides.fields ?? {},
  settings: overrides.settings ?? {},
})
