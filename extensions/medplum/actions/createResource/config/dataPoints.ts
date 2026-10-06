import { type DataPointDefinition } from '@awell-health/extensions-core'
import { batchResultDataPoints } from '../../../utils'

export const dataPoints = {
  ...batchResultDataPoints,
  resourceId: {
    key: 'resourceId',
    valueType: 'string',
  },
  resourceType: {
    key: 'resourceType',
    valueType: 'string',
  },
  wasResourceFound: {
    key: 'wasResourceFound',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
