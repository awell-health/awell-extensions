import { DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  name: {
    key: 'name',
    valueType: 'string',
  },
  addressOne: {
    key: 'addressOne',
    valueType: 'string',
  },
  addressTwo: {
    key: 'addressTwo',
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
  phone: {
    key: 'phone',
    valueType: 'telephone',
  },
  pharmacyObject: {
    key: 'pharmacyObject',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
