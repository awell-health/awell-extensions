import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '../../../../../../lib/types'

export const fields = {
  signUrl: {
    id: 'signUrl',
    label: 'Sign URL',
    description:
      'Enter the sign URL generated via the "Create embedded signature request with template" action',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  signUrl: z.string().url(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
