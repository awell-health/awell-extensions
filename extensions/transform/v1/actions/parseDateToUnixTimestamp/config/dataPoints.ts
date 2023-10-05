import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  unixTimestamp: {
    key: 'unixTimestamp',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
