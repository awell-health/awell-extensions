import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  number: {
    key: 'number',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
