import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  contactData: {
    key: 'contactData',
    valueType: 'json',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  mobileNumber: {
    key: 'mobileNumber',
    valueType: 'telephone',
  },
  city: {
    key: 'city',
    valueType: 'string',
  },
  country: {
    key: 'country',
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
