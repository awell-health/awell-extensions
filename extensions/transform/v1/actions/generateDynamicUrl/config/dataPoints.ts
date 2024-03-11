import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  url: {
    key: 'url',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
