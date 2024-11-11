import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  call_id: {
    // This key cannot be changed as it will break the integration!
    // Needs to match exactly with the key in the payload sent by Bland
    key: 'call_id',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
