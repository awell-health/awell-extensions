import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  encounter: {
    key: 'encounter',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
