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
  email: {
    key: 'email',
    valueType: 'string',
  },
  dob: {
    key: 'dob',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>
