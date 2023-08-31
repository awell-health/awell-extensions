import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  appointmentData: {
    key: 'appointmentData',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
