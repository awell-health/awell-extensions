import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  body: {
    key: 'body',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
