import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  verified: {
    key: 'verified',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
