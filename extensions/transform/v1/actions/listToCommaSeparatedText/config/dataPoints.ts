import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  listText: {
    key: 'listText',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
