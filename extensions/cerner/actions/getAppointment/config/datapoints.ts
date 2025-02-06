import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  appointment: {
    key: 'appointment',
    valueType: 'json',
  },
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
  appointmentStatus: {
    key: 'appointmentStatus',
    valueType: 'string',
  },
  appointmentStartDateTime: {
    key: 'appointmentStartDateTime',
    valueType: 'date',
  },
  appointmentTypeCode: {
    key: 'appointmentTypeCode',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
