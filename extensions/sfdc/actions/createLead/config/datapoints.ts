import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  createdLeadId: {
    key: 'createdLeadId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
