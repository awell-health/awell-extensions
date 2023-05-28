import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  signatureRequestId: {
    key: 'signatureRequestId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
