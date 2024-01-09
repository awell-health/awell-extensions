import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  valueSelected: {
    key: 'valueSelected',
    valueType: 'string',
  },
  labelSelected: {
    key: 'labelSelected',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
