import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  healthiePatientId: {
    key: 'healthiePatientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
