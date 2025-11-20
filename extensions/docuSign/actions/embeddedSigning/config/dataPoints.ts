import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  signed: {
    key: 'signed',
    valueType: 'boolean',
  },
  envelopeStatus: {
    key: 'envelopeStatus',
    valueType: 'string',
  },
  recipientStatus: {
    key: 'recipientStatus',
    valueType: 'string',
  },
  completedAt: {
    key: 'completedAt',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
