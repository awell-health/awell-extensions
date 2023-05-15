import { type DataPointDefinition } from '../../../../lib/types'
import { address } from '../../shared/dataPoints'

export const facilityIdDataPoint = {
  facilityId: {
    key: 'facilityId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const facilityDataPoints = {
  name: {
    key: 'name',
    valueType: 'string',
  },
  npi: {
    key: 'npi',
    valueType: 'string',
  },
  active: {
    key: 'active',
    valueType: 'boolean',
  },
  tin: {
    key: 'tin',
    valueType: 'string',
  },
  ...address,
} satisfies Record<string, DataPointDefinition>
