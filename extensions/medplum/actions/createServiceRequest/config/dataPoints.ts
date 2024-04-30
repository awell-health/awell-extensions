import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  serviceRequestId: {
    key: 'serviceRequestId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
