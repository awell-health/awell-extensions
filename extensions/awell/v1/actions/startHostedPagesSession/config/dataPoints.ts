import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  sessionUrl: {
    key: 'sessionUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
