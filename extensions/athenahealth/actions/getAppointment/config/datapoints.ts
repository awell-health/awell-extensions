import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
  startTime: {
    key: 'startTime',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  type: {
    key: 'type',
    valueType: 'string',
  },
  date: {
    key: 'date',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
