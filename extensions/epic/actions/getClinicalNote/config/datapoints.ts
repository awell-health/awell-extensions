import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  documentReference: {
    key: 'documentReference',
    valueType: 'json',
  },
  binary: {
    key: 'binary',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
