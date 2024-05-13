import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  medicationData: {
    key: 'medicationData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
