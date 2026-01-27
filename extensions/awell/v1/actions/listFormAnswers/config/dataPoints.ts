import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  output: {
    key: 'output',
    valueType: 'string',
  },
  numberOfFormsCaptured: {
    key: 'numberOfFormsCaptured',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
