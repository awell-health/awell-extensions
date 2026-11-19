import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  fileUrl: {
    key: 'fileUrl',
    valueType: 'string',
  },
  publicId: {
    key: 'publicId',
    valueType: 'string',
  },
  linkExpiresAt: {
    key: 'linkExpiresAt',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
