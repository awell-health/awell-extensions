import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  ticketId: {
    key: 'ticketId',
    valueType: 'string',
  },
  ticketUrl: {
    key: 'ticketUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
