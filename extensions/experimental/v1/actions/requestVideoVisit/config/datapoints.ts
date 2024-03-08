import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  requestVideoVisit: {
    key: 'requestVideoVisit',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
