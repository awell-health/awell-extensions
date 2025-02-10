import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  appointments: {
    key: 'appointments',
    valueType: 'json',
  },
  explanation: {
    key: 'explanation',
    valueType: 'string',
  },
  appointmentCountsByStatus: {
    key: 'appointmentCountsByStatus',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
