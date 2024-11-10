import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  callData: {
    key: 'callData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
