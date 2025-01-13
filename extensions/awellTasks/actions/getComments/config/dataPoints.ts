import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  comments: {
    key: 'comments',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
