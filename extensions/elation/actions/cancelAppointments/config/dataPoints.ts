import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  cancelledAppointments: {
    key: 'cancelledAppointments',
    valueType: 'json',
  },
  explanation: {
    key: 'explanation',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
