import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  success: {
    key: 'success',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
