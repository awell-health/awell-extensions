import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  faxId: {
    key: 'faxId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
