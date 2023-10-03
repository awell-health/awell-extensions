import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  firstName: {
    key: 'physicianFirstName',
    valueType: 'string',
  },
  lastName: {
    key: 'physicianLastName',
    valueType: 'string',
  },
  credentials: {
    key: 'physicianCredentials',
    valueType: 'string',
  },
  email: {
    key: 'physicianEmail',
    valueType: 'string',
  },
  NPI: {
    key: 'physicianNPI',
    valueType: 'string',
  },
  userId: {
    key: 'physicianUserId',
    valueType: 'number',
  },
  caregiverPracticeId: {
    key: 'caregiverPracticeId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
