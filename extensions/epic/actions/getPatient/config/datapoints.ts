import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patient: {
    key: 'patient',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
