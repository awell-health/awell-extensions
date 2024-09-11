import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  createdGoalId: {
    key: 'createdGoalId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
