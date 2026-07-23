import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  conversationId: {
    key: 'conversationId',
    valueType: 'string',
  },
  smsResponse: {
    key: 'smsResponse',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
