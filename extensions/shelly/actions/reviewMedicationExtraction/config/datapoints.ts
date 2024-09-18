import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  validatedData: {
    key: 'validatedData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
