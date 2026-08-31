import { type DataPointDefinition } from '@awell-health/extensions-core'
import { address } from '../../shared/dataPoints'

export const facilityDataPoints = {
  facilityId: {
    key: 'facilityId',
    valueType: 'string',
  },
  facilityName: {
    key: 'facilityName',
    valueType: 'string',
  },
  npi: {
    key: 'npi',
    valueType: 'string',
  },
  tin: {
    key: 'tin',
    valueType: 'string',
  },
  active: {
    key: 'active',
    valueType: 'boolean',
  },
  ...address,
} satisfies Record<string, DataPointDefinition>
