import { type DataPointDefinition } from '@awell-health/extensions-core'

/**
 * Identifiers returned by Infobip when it accepts the request. Acceptance is
 * not delivery: use `messageId` to look the message up in Infobip's logs
 * (Analyze > Logs) to see whether it was delivered, bounced or rejected.
 */
export const dataPoints = {
  bulkId: {
    key: 'bulkId',
    valueType: 'string',
  },
  messageId: {
    key: 'messageId',
    valueType: 'string',
  },
  messageStatus: {
    key: 'messageStatus',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
