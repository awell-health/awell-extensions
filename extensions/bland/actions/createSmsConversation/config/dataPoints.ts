import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  conversationId: {
    key: 'conversationId',
    valueType: 'string',
  },
  createResponse: {
    key: 'createResponse',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
