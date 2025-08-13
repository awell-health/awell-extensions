import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  appointments: {
    key: 'appointments',
    valueType: 'json',
  },
  appointment_exists: {
    key: 'appointment_exists',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
