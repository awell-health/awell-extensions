import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  tagsFound: {
    key: 'tagsFound',
    valueType: 'boolean',
  },
  explanation: {
    key: 'explanation',
    valueType: 'string',
  }
} satisfies Record<string, DataPointDefinition> 