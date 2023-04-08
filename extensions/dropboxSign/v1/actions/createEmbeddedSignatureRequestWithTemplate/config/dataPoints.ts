import { type DataPointDefinition } from '../../../../../../lib/types'

export const dataPoints = {
  signUrl: {
    key: 'signUrl',
    valueType: 'string',
  },
  expiresAt: {
    key: 'expiresAt',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
