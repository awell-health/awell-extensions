import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  signUrl: {
    key: 'signUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
