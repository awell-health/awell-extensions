import { type DataPointDefinition } from '@/lib/types'

export const dataPoints = {
  signatureRequestId: {
    key: 'signatureRequestId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
