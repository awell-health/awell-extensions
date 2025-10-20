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
    label: 'Recipient 1 signer role',
    description: "Must match an existing role in chosen template. It's case-sensitive. Recipient 1 will sign first.",
    type: FieldType.STRING,
    required: true,
  },
  patientSignerName: {
    id: 'patientSignerName',
    label: 'Recipient 1 signer name',
    description: 'The name of the first signer.',
    type: FieldType.STRING,
    required: true,
  },
  patientSignerEmail: {
    id: 'patientSignerEmail',
    label: 'Recipient 1 signer email',
    description: 'The email address of the first signer.',
    type: FieldType.STRING,
    required: true,
  },
  providerSignerRole: {
    id: 'providerSignerRole',
    label: 'Recipient 2 signer role',
    description: "Must match an existing role in chosen template. It's case-sensitive. Recipient 2 will sign second, after Recipient 1.",
    type: FieldType.STRING,
    required: true,
  },
  providerSignerName: {
    id: 'providerSignerName',
    label: 'Recipient 2 signer name',
    description: 'The name of the second signer.',
    type: FieldType.STRING,
    required: true,
  },
  providerSignerEmail: {
    id: 'providerSignerEmail',
    label: 'Recipient 2 signer email',
    description: 'The email address of the second signer.',
    type: FieldType.STRING,
    required: true,
  },
  providerClientUserId: {
    id: 'providerClientUserId',
    label: 'Recipient 2 client user ID',
    description: 'Unique identifier for the second signer used for embedded signing. This should match the stakeholder ID in your care flow.',
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
