import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  updatedTags: {
    key: 'updatedTags',
    valueType: 'string',
  },
  explanation: {
    key: 'explanation',
    valueType: 'string',
  }
} satisfies Record<string, DataPointDefinition>
