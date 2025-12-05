import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  nextDateOccurrence: {
    key: 'nextDateOccurrence',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
