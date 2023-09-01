import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  patientId: {
    key: 'patientId',
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
  phone: {
    key: 'phone',
    valueType: 'string',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  dob: {
    key: 'dob',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
