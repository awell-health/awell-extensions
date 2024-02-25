import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  codes: {
    key: 'codes',
    valueType: 'strings_array',
  },
  stringResponse: {
    key: 'stringResponse',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
