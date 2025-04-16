import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  output: {
    key: 'output',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
