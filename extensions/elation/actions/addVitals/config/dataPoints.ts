import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  vitalsId: {
    key: 'vitalsId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
