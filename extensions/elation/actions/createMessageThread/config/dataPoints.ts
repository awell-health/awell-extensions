import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  messageThreadId: {
    key: 'messageThreadId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
