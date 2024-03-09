import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  stringifiedMedicationData: {
    key: 'stringifiedMedicationData',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
