import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  envelopeId: {
    key: 'envelopeId',
    valueType: 'string',
  },
  signUrl: {
    key: 'signUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
