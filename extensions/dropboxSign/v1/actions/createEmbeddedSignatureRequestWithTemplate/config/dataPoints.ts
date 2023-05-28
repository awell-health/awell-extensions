import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  signatureRequestId: {
    key: 'signatureRequestId',
    valueType: 'string',
  },
  signUrl: {
    key: 'signUrl',
    valueType: 'string',
  },
  expiresAt: {
    key: 'expiresAt',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
