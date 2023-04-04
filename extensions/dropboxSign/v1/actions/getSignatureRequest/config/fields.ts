import { type Field, FieldType } from '../../../../../../lib/types'

export const fields = {
  signatureRequestId: {
    id: 'signatureRequestId',
    label: 'The id of the incomplete SignatureRequest to cancel.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>
