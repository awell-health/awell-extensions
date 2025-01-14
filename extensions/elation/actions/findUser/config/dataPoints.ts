import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  userId: {
    key: 'userId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
