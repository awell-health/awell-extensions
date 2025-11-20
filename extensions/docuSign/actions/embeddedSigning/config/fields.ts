import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  signUrl: {
    id: 'signUrl',
    label: 'Sign URL',
    description:
      'Enter the sign URL generated via the "Create embedded signature request with template" action',
    type: FieldType.STRING,
    required: true,
  },
  envelopeId: {
    id: 'envelopeId',
    label: 'Envelope ID',
    description: 'The DocuSign envelope ID',
    type: FieldType.STRING,
    required: true,
  },
  clientUserId: {
    id: 'clientUserId',
    label: 'Client User ID',
    description:
      'The client user ID for the recipient who should sign (used for validation)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  signUrl: z.string().url(),
  envelopeId: z.string().min(1),
  clientUserId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
