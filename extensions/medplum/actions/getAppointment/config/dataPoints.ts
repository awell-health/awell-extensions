import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  appointmentData: {
    key: 'appointmentData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
