import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  serializedJson: {
    key: 'serializedJson',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
