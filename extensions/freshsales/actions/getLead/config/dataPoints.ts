import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  leadData: {
    key: 'leadData',
    valueType: 'json',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  workNumber: {
    key: 'workNumber',
    valueType: 'string',
  },
  mobileNumber: {
    key: 'mobileNumber',
    valueType: 'string',
  },
  address: {
    key: 'address',
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
  zipcode: {
    key: 'zipcode',
    valueType: 'string',
  },
  country: {
    key: 'country',
    valueType: 'string',
  },
  timeZone: {
    key: 'timeZone',
    valueType: 'string',
  },
  displayName: {
    key: 'displayName',
    valueType: 'string',
  },
  firstName: {
    key: 'firstName',
    valueType: 'string',
  },
  lastName: {
    key: 'lastName',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
