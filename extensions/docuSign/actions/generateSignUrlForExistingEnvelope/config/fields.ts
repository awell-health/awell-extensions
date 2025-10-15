import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  envelopeId: {
    id: 'envelopeId',
    label: 'Envelope ID',
    description: 'The ID of the existing DocuSign envelope. This is returned from the "Create sequential embedded signature request" action.',
    type: FieldType.STRING,
    required: true,
  },
  signerName: {
    id: 'signerName',
    label: 'Signer name',
    description: 'The name of the person who will sign the document. Must match the name of a recipient already in the envelope.',
    type: FieldType.STRING,
    required: true,
  },
  signerEmail: {
    id: 'signerEmail',
    label: 'Signer email',
    description: 'The email address of the person who will sign the document. Must match the email of a recipient already in the envelope.',
    type: FieldType.STRING,
    required: true,
  },
  clientUserId: {
    id: 'clientUserId',
    label: 'Client user ID',
    description: 'Unique identifier for the signer used for embedded signing. Must match the client user ID of a recipient already in the envelope.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  envelopeId: z.string(),
  signerName: z.string(),
  signerEmail: z.string(),
  clientUserId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
