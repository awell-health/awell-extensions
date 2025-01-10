import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  body: {
    key: 'body',
    valueType: 'string',
  },
  signedBy: {
    key: 'signedBy',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
