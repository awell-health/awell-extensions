import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  // Serialized JSON object stored in JSON data point
  medicationData: {
    key: 'medicationData',
    valueType: 'json',
  },
  // Serialized JSON object stored in string data point
  medicationDataString: {
    key: 'medicationDataString',
    valueType: 'string',
  },
  // Pretty / human readable text output
  prettyMedicationData: {
    key: 'prettyMedicationData',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
