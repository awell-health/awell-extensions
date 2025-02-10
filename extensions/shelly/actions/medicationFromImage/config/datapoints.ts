import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  data: {
    key: 'data',
    valueType: 'json',
  },
  medicationAsText: {
    key: 'medicationAsText',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
