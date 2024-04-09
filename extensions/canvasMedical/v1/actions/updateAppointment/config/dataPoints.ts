import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
