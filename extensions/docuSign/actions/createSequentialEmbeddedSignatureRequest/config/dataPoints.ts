import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  envelopeId: {
    key: 'envelopeId',
    valueType: 'string',
  },
  recipient1SignUrl: {
    key: 'recipient1SignUrl',
    valueType: 'string',
  },
  recipient1ClientUserId: {
    key: 'recipient1ClientUserId',
    valueType: 'string',
  },
  recipient2ClientUserId: {
    key: 'recipient2ClientUserId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
