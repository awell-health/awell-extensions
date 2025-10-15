import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  envelopeId: {
    id: 'envelopeId',
    label: 'Envelope ID',
    description: 'The ID of the existing DocuSign envelope. This is returned from the "Create embedded signature request with template" action.',
    type: FieldType.STRING,
    required: true,
  },
  signerRole: {
    id: 'signerRole',
    label: 'Signer role',
    description: 'Must match an existing role in the template used to create the envelope. It\'s case-sensitive.',
    type: FieldType.STRING,
    required: true,
  },
  signerName: {
    id: 'signerName',
    label: 'Signer name',
    description: 'The name of the person who will sign the document.',
    type: FieldType.STRING,
    required: true,
  },
  signerEmail: {
    id: 'signerEmail',
    label: 'Signer email',
    description: 'The email address of the person who will sign the document.',
    type: FieldType.STRING,
    required: true,
  },
  clientUserId: {
    id: 'clientUserId',
    label: 'Client user ID',
    description: 'Unique identifier for the signer used for embedded signing. This should match the stakeholder ID or a unique identifier from your care flow.',
    type: FieldType.STRING,
    required: true,
  },
  routingOrder: {
    id: 'routingOrder',
    label: 'Routing order',
    description: 'The signing order for this recipient. Use "1" for the first signer, "2" for the second, etc. For sequential signing, this determines when the recipient can sign.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  envelopeId: z.string(),
  signerRole: z.string(),
  signerName: z.string(),
  signerEmail: z.string(),
  clientUserId: z.string(),
  routingOrder: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
