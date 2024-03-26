import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  clinicalDocumentId: {
    key: 'clinicalDocumentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
