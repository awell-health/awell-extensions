import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  vitals: {
    key: 'vitals',
    valueType: 'json',
  },
  documentDate: {
    key: 'documentDate',
    valueType: 'string',
  },
  vitalsId: {
    key: 'vitalsId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
