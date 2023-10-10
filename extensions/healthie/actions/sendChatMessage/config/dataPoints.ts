import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  conversationId: {
    key: 'conversationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
