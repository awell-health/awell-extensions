import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  encounters: {
    key: 'encounters',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
