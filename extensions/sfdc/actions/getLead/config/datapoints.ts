import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  leadData: {
    key: 'leadData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
