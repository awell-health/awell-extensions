import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  res: {
    key: 'res',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
