import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  coverageId: {
    key: 'coverageId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
