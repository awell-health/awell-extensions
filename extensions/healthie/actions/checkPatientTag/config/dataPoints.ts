import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  hasTag: {
    key: 'hasTag',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
