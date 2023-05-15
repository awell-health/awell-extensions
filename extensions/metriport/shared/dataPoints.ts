import { type DataPointDefinition } from '../../../lib/types'

export const address = {
  addressLine1: {
    key: 'addressLine1',
    valueType: 'string',
  },
  addressLine2: {
    key: 'addressLine2',
    valueType: 'string',
  },
  city: {
    key: 'city',
    valueType: 'string',
  },
  state: {
    key: 'state',
    valueType: 'string',
  },
  zip: {
    key: 'zip',
    valueType: 'string',
  },
  country: {
    key: 'country',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
