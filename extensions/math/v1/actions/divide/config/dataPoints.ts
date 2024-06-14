import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  quotient: {
    key: 'quotient',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
