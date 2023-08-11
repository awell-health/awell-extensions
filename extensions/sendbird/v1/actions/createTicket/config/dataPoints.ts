import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  ticketId: {
    key: 'ticketId',
    /*
      Ticket IDs are integers in Sendbird
      https://sendbird.com/docs/desk/platform-api/v1/features/ticket#2-resource-representation
    */
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
