import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  ticketId: {
    key: 'ticketId',
    valueType: 'number',
  },
  ticketUrl: {
    key: 'ticketUrl',
    valueType: 'string',
  },
  createdAt: {
    key: 'createdAt',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
