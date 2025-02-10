import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  appointment: {
    key: 'appointment',
    valueType: 'json',
  },
  appointmentExists: {
    key: 'appointmentExists',
    valueType: 'boolean',
  },
  explanation: {
    key: 'explanation',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
