import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  result: {
    key: 'result',
    valueType: 'string',
  },
  resultJson: {
    key: 'resultJson',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
