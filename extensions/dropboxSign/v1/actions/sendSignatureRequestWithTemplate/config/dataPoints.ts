import { type DataPointDefinition } from '@awell-health/awell-extensions-types'

export const dataPoints = {
  signatureRequestId: {
    key: 'signatureRequestId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
