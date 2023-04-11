import { type Field, FieldType } from '../../../../../../lib/types'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  signatureRequestId: {
    id: 'signatureRequestId',
    label: 'Signature request ID',
    description: 'The id of the incomplete SignatureRequest to cancel.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  signatureRequestId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
