import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  date: {
    key: 'date',
    valueType: 'date',
  },
  appointmentTypeId: {
    key: 'appointmentTypeId',
    valueType: 'string',
  },
  appointmentTypeName: {
    key: 'appointmentTypeName',
    valueType: 'string',
  },
  contactType: {
    key: 'contactType',
    valueType: 'string',
  },
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
