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
  sex: {
    key: 'sex',
    valueType: 'string',
  },
  primaryPhysicianId: {
    key: 'primaryPhysicianId',
    valueType: 'number',
  },
  caregiverPracticeId: {
    key: 'caregiverPracticeId',
    valueType: 'number',
  },
  mainPhone: {
    key: 'mainPhone',
    valueType: 'telephone',
  },
  mobilePhone: {
    key: 'mobilePhone',
    valueType: 'telephone',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  middleName: {
    key: 'middleName',
    valueType: 'string',
  },
  actualName: {
    key: 'actualName',
    valueType: 'string',
  },
  genderIdentity: {
    key: 'genderIdentity',
    valueType: 'string',
  },
  legalGenderMarker: {
    key: 'legalGenderMarker',
    valueType: 'string',
  },
  pronouns: {
    key: 'pronouns',
    valueType: 'string',
  },
  sexualOrientation: {
    key: 'sexualOrientation',
    valueType: 'string',
  },
  ssn: {
    key: 'ssn',
    valueType: 'string',
  },
  ethnicity: {
    key: 'ethnicity',
    valueType: 'string',
  },
  race: {
    key: 'race',
    valueType: 'string',
  },
  preferredLanguage: {
    key: 'preferredLanguage',
    valueType: 'string',
  },
  notes: {
    key: 'notes',
    valueType: 'string',
  },
  previousFirstName: {
    key: 'previousFirstName',
    valueType: 'string',
  },
  previousLastName: {
    key: 'previousLastName',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  preferredServiceLocationId: {
    key: 'preferredServiceLocationId',
    valueType: 'number',
  },
  patientObject: {
    key: 'patientObject',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
