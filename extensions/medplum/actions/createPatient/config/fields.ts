import {
  FieldType,
  StringType,
  type Field,
} from '@awell-health/extensions-core'
import { type ZodObject, type ZodTypeAny } from 'zod'
import { PatientSchema } from '../../../fhir/schemas'

export const fields = {
  firstName: {
    id: 'firstName',
    label: 'First name',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  lastName: {
    id: 'lastName',
    label: 'Last name',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  mobilePhone: {
    id: 'mobilePhone',
    label: 'Mobile phone',
    description: '',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  birthDate: {
    id: 'birthDate',
    label: 'Birth date',
    description: '',
    type: FieldType.DATE,
    required: false,
  },
  gender: {
    id: 'gender',
    label: 'Gender',
    description: 'Valid values are "male", "female", "other", "unknown"',
    type: FieldType.STRING,
    required: false,
  },
  address: {
    id: 'address',
    label: 'Address',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  city: {
    id: 'city',
    label: 'City',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  state: {
    id: 'state',
    label: 'State',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  country: {
    id: 'country',
    label: 'Country',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
  postalCode: {
    id: 'postalCode',
    label: 'Postal code',
    description: '',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = PatientSchema satisfies ZodObject<
  Record<keyof typeof fields, ZodTypeAny>
>
