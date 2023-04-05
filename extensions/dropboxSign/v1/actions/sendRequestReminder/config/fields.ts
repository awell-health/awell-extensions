import { type Field, FieldType } from '../../../../../../lib/types'

export const fields = {
  signatureRequestId: {
    id: 'signatureRequestId',
    label: 'Signature request ID',
    description: 'The id of the SignatureRequest to send a reminder for.',
    type: FieldType.STRING,
    required: true,
  },
  signerEmailAddress: {
    id: 'signerEmailAddress',
    label: 'Signer email address',
    description: 'The email address of the signer to send a reminder to.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
