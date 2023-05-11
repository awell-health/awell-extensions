import { type DataPointDefinition } from '../../../../lib/types'
import { address } from '../../shared/dataPoints'

export const patientIdDataPoint = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const patientDataPoints = {
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
  genderAtBirth: {
    key: 'genderAtBirth',
    valueType: 'string',
  },
  driversLicenseValue: {
    key: 'driversLicenseValue',
    valueType: 'string',
  },
  driversLicenseState: {
    key: 'driversLicenseState',
    valueType: 'string',
  },
  ...address,
  phone: {
    key: 'phone',
    valueType: 'string',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
