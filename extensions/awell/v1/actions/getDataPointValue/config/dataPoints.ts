import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  valueString: {
    key: 'valueString',
    valueType: 'string',
  },
  valueNumber: {
    key: 'valueNumber',
    valueType: 'number',
  },
  valueDate: {
    key: 'valueDate',
    valueType: 'date',
  },
  valueJson: {
    key: 'valueJson',
    valueType: 'json',
  },
  valueBoolean: {
    key: 'valueBoolean',
    valueType: 'boolean',
  },
  valueTelephone: {
    key: 'valueTelephone',
    valueType: 'telephone',
  },
  valueStringsArray: {
    key: 'valueStringsArray',
    valueType: 'strings_array',
  },
  valueNumbersArray: {
    key: 'valueStringsArray',
    valueType: 'strings_array',
  },
} satisfies Record<string, DataPointDefinition>
