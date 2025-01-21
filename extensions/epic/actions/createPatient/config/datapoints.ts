import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  resourceId: {
    key: 'resourceId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
