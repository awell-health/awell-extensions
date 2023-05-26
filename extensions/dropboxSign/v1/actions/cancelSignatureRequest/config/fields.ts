import { type Field, FieldType } from '@awell-health/awell-extensions-types'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  signatureRequestId: {
    id: 'signatureRequestId',
    label: 'Signature request ID',
    description:
      'The id of the SignatureRequest to cancel. Please note you can only cancel incomplete signature requests.',
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
