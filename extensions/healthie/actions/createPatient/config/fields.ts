import {
  type Field,
  FieldType,
  StringType,
} from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  first_name: {
    id: 'first_name',
    label: 'First name',
    description: 'The first name of the patient.',
    type: FieldType.STRING,
    required: true,
  },
  last_name: {
    id: 'last_name',
    label: 'Last name',
    description: 'The last name of the patient.',
    type: FieldType.STRING,
    required: true,
  },
  legal_name: {
    id: 'legal_name',
    label: 'Legal name',
    description:
      "The patient's legal name which will be used in CMS 1500 Claims, Invoices, and Superbills.",
    type: FieldType.STRING,
  },
  dob: {
    id: 'dob',
    label: 'Date of birth',
    description: 'Date of birth of the patient',
    type: FieldType.DATE,
    required: false,
  },
  email: {
    id: 'email',
    label: 'Email',
    description:
      'The email address of the patient. If email is NOT provided, we will still create the patient in Healthie but without the email.',
    type: FieldType.STRING,
    required: false,
  },
  phone_number: {
    id: 'phone_number',
    label: 'Phone number',
    description: 'The phone number of the patient.',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
  },
  send_invite: {
    id: 'send_invite',
    label: 'Send invite email',
    description:
      'Whether an invite email should be sent to the newly created patient.',
    type: FieldType.BOOLEAN,
  },
  provider_id: {
    id: 'provider_id',
    label: 'Provider ID',
    description:
      'This is the ID of the provider and defaults to the user the API key is associated with. Also known as the `dietitian_id`.',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  legal_name: z.string().optional(),
  email: z.string().optional(),
  dob: z.string().optional(),
  phone_number: z.string().optional(),
  send_invite: z.boolean().optional(),
  provider_id: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export interface CreatePatientPayload {
  first_name: string
  last_name: string
  legal_name?: string
  email?: string
  dob?: string
  skipped_email?: boolean
  phone_number?: string
  dietitian_id?: string
  user_group_id?: string
  dont_send_welcome?: boolean
}
