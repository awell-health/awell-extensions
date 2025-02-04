import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  messageId: {
    key: 'messageId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
