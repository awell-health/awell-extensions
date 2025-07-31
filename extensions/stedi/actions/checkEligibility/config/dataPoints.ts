import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  data: {
    key: 'data',
    valueType: 'string', // JSON doesn't work reliably with the agent
  },
} satisfies Record<string, DataPointDefinition>
