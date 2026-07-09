import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  conversationId: {
    key: 'conversationId',
    valueType: 'string',
  },
  workflowId: {
    key: 'workflowId',
    valueType: 'string',
  },
  messageId: {
    key: 'messageId',
    valueType: 'string',
  },
  message: {
    key: 'message',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
