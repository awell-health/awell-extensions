import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  claimId: {
    key: 'claimId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
