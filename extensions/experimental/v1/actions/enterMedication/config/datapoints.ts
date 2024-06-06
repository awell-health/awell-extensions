import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  // This data point should be deprecated but keeping it here for backward compatibility
  stringifiedMedicationData: {
    key: 'stringifiedMedicationData',
    valueType: 'string',
  },
  medicationData: {
    key: 'medicationData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
