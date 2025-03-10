import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  serviceRequestResource: {
    key: 'serviceRequestResource',
    valueType: 'json',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  intent: {
    key: 'intent',
    valueType: 'string',
  },
  priority: {
    key: 'priority',
    valueType: 'string',
  },
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
