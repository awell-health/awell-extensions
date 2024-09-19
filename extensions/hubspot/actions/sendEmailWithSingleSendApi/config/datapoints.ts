import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  statusId: {
    key: 'statusId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
