import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  allStrings: {
    key: 'allStrings',
    valueType: 'string_array',
  },
  allNumbers: {
    key: 'allNumbers',
    valueType: 'number_array',
  },
} satisfies Record<string, DataPointDefinition>
