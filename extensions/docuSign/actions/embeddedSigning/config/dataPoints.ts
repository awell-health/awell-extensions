import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  signed: {
    key: 'signed',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
