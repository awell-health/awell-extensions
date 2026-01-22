import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  messageTs: {
    key: 'messageTs',
    valueType: 'string',
  },
  channelId: {
    key: 'channelId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
