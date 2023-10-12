import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  fileUrl: {
    key: 'fileUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
