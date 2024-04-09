import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  createdPatientId: {
    key: 'createdPatientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
