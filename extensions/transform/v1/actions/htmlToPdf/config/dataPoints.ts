import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  base64Pdf: {
    key: 'base64Pdf',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
