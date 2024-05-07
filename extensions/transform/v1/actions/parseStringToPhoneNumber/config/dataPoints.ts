import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  phoneNumber: {
    key: 'phoneNumber',
    valueType: 'telephone',
  },
} satisfies Record<string, DataPointDefinition>
