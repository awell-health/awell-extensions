import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  signUrl: {
    key: 'signUrl',
    valueType: 'string',
  },
  clientUserId: {
    key: 'clientUserId',
    valueType: 'string',
  },
  envelopeId: {
    key: 'envelopeId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
