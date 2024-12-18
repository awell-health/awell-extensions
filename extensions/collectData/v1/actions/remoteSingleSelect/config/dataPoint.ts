import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  value: {
    key: 'value',
    valueType: 'string',
  },
  label: {
    key: 'label',
    valueType: 'string',
  },
  selectedOption: {
    key: 'selectedOption',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
