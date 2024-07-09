import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  inches: {
    key: 'inches',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
