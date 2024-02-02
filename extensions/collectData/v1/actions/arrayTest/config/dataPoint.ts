import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  allStrings: {
    key: 'allStrings',
    valueType: 'string',
  },
  numberSum: {
    key: 'numberSum',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
