import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  medicationData: {
    key: 'medicationData',
    valueType: 'json',
  },
  medicationDataString: {
    key: 'medicationDataString',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
