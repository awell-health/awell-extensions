import { type Field, FieldType } from '@awell-health/awell-extensions-types'
import { z, type ZodTypeAny } from 'zod'

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

export const FieldsValidationSchema = z.object({
  signatureRequestId: z.string(),
  signerEmailAddress: z.string().email(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
