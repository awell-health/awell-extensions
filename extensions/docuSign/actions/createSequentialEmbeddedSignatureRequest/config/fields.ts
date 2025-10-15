import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  templateId: {
    id: 'templateId',
    label: 'Template ID',
    description: 'Use the template id to create a SignatureRequest from a template.',
    type: FieldType.STRING,
    required: true,
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    description: 'The subject in the email that will be sent to the signers.',
    type: FieldType.STRING,
    required: false,
  },
  message: {
    id: 'message',
    label: 'Message',
    description: 'The custom message in the email that will be sent to the signers.',
    type: FieldType.STRING,
    required: false,
  },
  patientSignerRole: {
    id: 'patientSignerRole',
    label: 'Patient signer role',
    description: "Must match an existing role in chosen template. It's case-sensitive. The patient will sign first.",
    type: FieldType.STRING,
    required: true,
  },
  patientSignerName: {
    id: 'patientSignerName',
    label: 'Patient signer name',
    description: 'The name of the patient signer.',
    type: FieldType.STRING,
    required: true,
  },
  patientSignerEmail: {
    id: 'patientSignerEmail',
    label: 'Patient signer email',
    description: 'The email address of the patient signer.',
    type: FieldType.STRING,
    required: true,
  },
  providerSignerRole: {
    id: 'providerSignerRole',
    label: 'Provider signer role',
    description: "Must match an existing role in chosen template. It's case-sensitive. The provider will sign second, after the patient.",
    type: FieldType.STRING,
    required: true,
  },
  providerSignerName: {
    id: 'providerSignerName',
    label: 'Provider signer name',
    description: 'The name of the provider signer.',
    type: FieldType.STRING,
    required: true,
  },
  providerSignerEmail: {
    id: 'providerSignerEmail',
    label: 'Provider signer email',
    description: 'The email address of the provider signer.',
    type: FieldType.STRING,
    required: true,
  },
  providerClientUserId: {
    id: 'providerClientUserId',
    label: 'Provider client user ID',
    description: 'Unique identifier for the provider used for embedded signing. This should match the provider stakeholder ID in your care flow.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  templateId: z.string(),
  subject: z.optional(z.string()),
  message: z.optional(z.string()),
  patientSignerRole: z.string(),
  patientSignerName: z.string(),
  patientSignerEmail: z.string(),
  providerSignerRole: z.string(),
  providerSignerName: z.string(),
  providerSignerEmail: z.string(),
  providerClientUserId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
