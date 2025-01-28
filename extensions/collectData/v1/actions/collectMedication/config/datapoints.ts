import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  // JSON object
  medicationData: {
    key: 'medicationData',
    valueType: 'json',
  },
  // Serialized JSON object
  medicationDataString: {
    key: 'medicationDataString',
    valueType: 'string',
  },
  // Pretty text output
  prettyMedicationData: {
    key: 'prettyMedicationData',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
