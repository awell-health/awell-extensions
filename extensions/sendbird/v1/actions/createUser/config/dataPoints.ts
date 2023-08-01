import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  userId: {
    key: 'userId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
