import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  text: {
    key: 'text',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
