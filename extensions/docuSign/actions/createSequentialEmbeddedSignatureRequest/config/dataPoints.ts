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
} satisfies Record<string, DataPointDefinition>
