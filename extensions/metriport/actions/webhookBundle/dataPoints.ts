import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  bundle: {
    key: 'bundle',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
