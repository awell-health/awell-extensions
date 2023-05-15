import { type DataPointDefinition } from '../../../../lib/types'
import { address } from '../../shared/dataPoints'

export const orgIdDataPoint = {
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const orgDataPoints = {
  type: {
    key: 'type',
    valueType: 'string',
  },
  name: {
    key: 'name',
    valueType: 'string',
  },
  ...address,
} satisfies Record<string, DataPointDefinition>
