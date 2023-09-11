import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  claimsId: {
    key: 'claimsId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
