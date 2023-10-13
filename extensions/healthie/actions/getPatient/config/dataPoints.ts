import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  firstName: {
    key: 'firstName',
    valueType: 'string',
  },
  lastName: {
    key: 'lastName',
    valueType: 'string',
  },
  dob: {
    key: 'dob',
    valueType: 'date',
  },
  gender: {
    key: 'gender',
    valueType: 'string',
  },
  isoSex: {
    key: 'isoSex',
    valueType: 'number',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  phoneNumber: {
    key: 'phoneNumber',
    valueType: 'telephone',
  },
  primaryProviderId: {
    key: 'primaryProviderId',
    valueType: 'string',
  },
  groupName: {
    key: 'groupName',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
