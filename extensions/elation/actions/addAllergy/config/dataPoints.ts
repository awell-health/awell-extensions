import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  allergyId: {
    key: 'allergyId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
