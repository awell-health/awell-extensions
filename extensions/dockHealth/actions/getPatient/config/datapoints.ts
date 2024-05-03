import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  firstName: {
    key: 'firstName',
    valueType: 'string',
  },
  lastName: {
    key: 'lastName',
    valueType: 'string',
  },
  // More data points can be added later
} satisfies Record<string, DataPointDefinition>
