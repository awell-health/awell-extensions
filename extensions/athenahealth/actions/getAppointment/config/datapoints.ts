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
  appointmentTypeName: {
    key: 'appointmentTypeName',
    valueType: 'string',
  },
  appointmentTypeId: {
    key: 'appointmentTypeId',
    valueType: 'string',
  },
  date: {
    key: 'date',
    valueType: 'date',
  },
  duration: {
    key: 'duration',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
