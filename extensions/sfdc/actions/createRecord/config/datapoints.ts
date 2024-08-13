import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  createdRecordId: {
    key: 'createdRecordId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
