import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { optionalEmailSchema } from '../../../../../src/utils/emailValidation'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  id: {
    id: 'id',
    label: 'ID',
    description: 'The id of the patient in Healthie.',
    type: FieldType.STRING,
    required: true,
  },
  first_name: {
    id: 'first_name',
    label: 'First name',
    description: 'The first name of the patient.',
    type: FieldType.STRING,
    required: false,
  },
  last_name: {
    id: 'last_name',
    label: 'Last name',
    description: 'The last name of the patient.',
    type: FieldType.STRING,
    required: false,
  },
  legal_name: {
    id: 'legal_name',
    label: 'Legal name',
    description:
      "The patient's legal name which will be used in CMS 1500 Claims, Invoices, and Superbills.",
    type: FieldType.STRING,
    required: false,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: 'The email address of the patient.',
    type: FieldType.STRING,
    required: false,
  },
  dob: {
    id: 'dob',
    label: 'Date of birth',
    description: 'Date of birth of the patient',
    type: FieldType.DATE,
    required: false,
  },
  phone_number: {
    id: 'phone_number',
    label: 'Phone number',
    description: 'The phone number of the patient.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    required: false,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description:
      'This is the ID of the provider and defaults to the user the API key is associated with. Also known as the `dietitian_id`.',
    type: FieldType.STRING,
    required: false,
  },
  user_group_id: {
    id: 'user_group_id',
    label: 'User group ID',
    description: 'The user group the patient belongs to.',
    type: FieldType.STRING,
    required: false,
  },
  active: {
    id: 'active',
    label: 'Active',
    description: 'Whether the patient is still active.',
    type: FieldType.BOOLEAN,
    required: false,
  },
  height: {
    id: 'height',
    label: 'Height',
    description: 'The height of the patient.',
    type: FieldType.STRING,
    required: false,
  },
  gender: {
    id: 'gender',
    label: 'Gender',
    description:
      'The gender of the patient. Either "Female", "Male", or "Other".',
    type: FieldType.STRING,
    required: false,
  },
  gender_identity: {
    id: 'gender_identity',
    label: 'Gender identity',
    description: 'Should only be passed when gender is "Other"',
    type: FieldType.STRING,
    required: false,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description: 'The sex of the patient. Either "Female", "Male".',
    type: FieldType.STRING,
    required: false,
  },
  resend_welcome_email: {
    id: 'resend_welcome_email',
    label: 'Resend welcome email',
    description: 'Whether to resend the welcome email to the patient',
    type: FieldType.BOOLEAN,
    required: false,
  },
  record_identifier: {
    id: 'record_identifier',
    label: 'Record identifier',
    description: 'The record identifier of the patient',
    type: FieldType.STRING,
    required: false,
  },
  additional_record_identifier: {
    id: 'additional_record_identifier',
    label: 'Additional record identifier',
    description: 'An additional record identifier of the patient',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  id: z.string().min(1),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  legal_name: z.string().optional(),
  email: optionalEmailSchema,
  dob: z.string().optional(),
  phone_number: z.string().optional(),
  provider_id: z.string().optional(),
  user_group_id: z.string().optional(),
  active: z.boolean().optional(),
  height: z.string().optional(),
  gender: z.enum(['Female', 'Male', 'Other']).optional(),
  gender_identity: z.string().optional(),
  sex: z.enum(['Female', 'Male']).optional(),
  resend_welcome_email: z.boolean().optional(),
  record_identifier: z.string().optional(),
  additional_record_identifier: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
