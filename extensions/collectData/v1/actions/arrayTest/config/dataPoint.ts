import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  allStrings: {
    key: 'allStrings',
    valueType: 'strings_array',
  },
  allNumbers: {
    key: 'allNumbers',
    valueType: 'numbers_array',
  },
} satisfies Record<string, DataPointDefinition>
