import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  physicianFirstName: {
    key: 'physicianFirstName',
    valueType: 'string',
  },
  physicianLastName: {
    key: 'physicianLastName',
    valueType: 'string',
  },
  physicianCredentials: {
    key: 'physicianCredentials',
    valueType: 'string',
  },
  physicianEmail: {
    key: 'physicianEmail',
    valueType: 'string',
  },
  physicianNPI: {
    key: 'physicianNPI',
    valueType: 'string',
  },
  physicianUserId: {
    key: 'physicianUserId',
    valueType: 'number',
  },
  caregiverPracticeId: {
    key: 'caregiverPracticeId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
