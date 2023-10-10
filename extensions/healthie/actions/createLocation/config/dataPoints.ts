import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  locationId: {
    key: 'locationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
