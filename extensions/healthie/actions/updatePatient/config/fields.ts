import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'

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
  },
  last_name: {
    id: 'last_name',
    label: 'Last name',
    description: 'The last name of the patient.',
    type: FieldType.STRING,
  },
  legal_name: {
    id: 'legal_name',
    label: 'Legal name',
    description:
      "The patient's legal name which will be used in CMS 1500 Claims, Invoices, and Superbills.",
    type: FieldType.STRING,
  },
  skipped_email: {
    id: 'skipped_email',
    label: 'Skipped email',
    type: FieldType.BOOLEAN,
  },
  email: {
    id: 'email',
    label: 'Email',
    description: 'The email address of the patient.',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
  },
  dob: {
    id: 'dob',
    label: 'Date of birth',
    description: 'Date of birth of the patient',
    type: FieldType.DATE,
  },
  phone_number: {
    id: 'phone_number',
    label: 'Phone number',
    description: 'The phone number of the patient.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description:
      'This is the ID of the provider and defaults to the user the API key is associated with. Also known as the `dietitian_id`.',
    type: FieldType.STRING,
  },
  user_group_id: {
    id: 'user_group_id',
    label: 'User group ID',
    description: 'The user group the patient belongs to.',
    type: FieldType.STRING,
  },
  active: {
    id: 'active',
    label: 'Active',
    description: 'Whether the patient is still active.',
    type: FieldType.BOOLEAN,
  },
  height: {
    id: 'height',
    label: 'Height',
    description: 'The height of the patient.',
    type: FieldType.STRING,
  },
  gender: {
    id: 'gender',
    label: 'Gender',
    description:
      'The gender of the patient. Either "Female", "Male", or "Other".',
    type: FieldType.STRING,
  },
  gender_identity: {
    id: 'gender_identity',
    label: 'Gender identity',
    description: 'Should only be passed when gender is "Other"',
    type: FieldType.STRING,
  },
  sex: {
    id: 'sex',
    label: 'Sex',
    description: 'The sex of the patient. Either "Female", "Male".',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>
