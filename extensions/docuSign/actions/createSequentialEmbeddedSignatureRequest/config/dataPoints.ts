import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  envelopeId: {
    key: 'envelopeId',
    valueType: 'string',
  },
  patientSignUrl: {
    key: 'patientSignUrl',
    valueType: 'string',
  },
  providerSignUrl: {
    key: 'providerSignUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
