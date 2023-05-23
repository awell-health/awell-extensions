import { FieldType, type Field } from '../../../../lib/types'
import { address } from '../../shared/fields'

export const createFields = {
  facilityId: {
    id: 'facilityId',
    label: 'Facility ID',
    description: `The ID of the facility to create the Patient in`,
    type: FieldType.STRING,
    required: true,
  },
  firstName: {
    id: 'firstName',
    label: 'First Name',
    description: `The Patient's first name`,
    type: FieldType.STRING,
    required: true,
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    description: `The Patient's last name`,
    type: FieldType.STRING,
    required: true,
  },
  dob: {
    id: 'dob',
    label: 'Date of Birth',
    description: `The Patient's date of birth (DOB), formatted YYYY-MM-DD`,
    type: FieldType.STRING,
    required: true,
  },
  genderAtBirth: {
    id: 'genderAtBirth',
    label: 'Gender at Birth',
    description: `The Patient's gender at birth, can be one of M or F`,
    type: FieldType.STRING,
    required: true,
  },
  driversLicenseValue: {
    id: 'driversLicenseValue',
    label: 'Drivers License Value',
    description: `The Patient's driver's license number`,
    type: FieldType.STRING,
  },
  driversLicenseState: {
    id: 'driversLicenseState',
    label: 'Drivers License State',
    description: `The 2 letter state acronym where this ID was issued, for example: CA`,
    type: FieldType.STRING,
  },
  ...address,
  phone: {
    id: 'phone',
    label: 'Phone',
    description: `The Patient's 10 digit phone number, formatted 1234567899`,
    type: FieldType.STRING,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: `The Patient's email address`,
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const updateFields = {
  id: {
    id: 'id',
    label: 'Patient ID',
    description: 'The ID of the patient to update',
    type: FieldType.STRING,
    required: true,
  },
  ...createFields,
} satisfies Record<string, Field>

export const getFields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const deleteFields = {
  ...getFields,
  facilityId: {
    id: 'facilityId',
    label: 'Facility ID',
    description: 'The facility ID',
    type: FieldType.STRING,
    required: true,
  },
}
