import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '../../../../../../lib/types'

export const fields = {
  clientLabel: {
    id: 'clientLabel',
    label: 'Client label',
    description: 'The name of your client.',
    type: FieldType.STRING,
    required: true,
  },
  flowLabel: {
    id: 'flowLabel',
    label: 'Subject',
    description: 'The name of your flow',
    type: FieldType.STRING,
    required: true,
  },
  variantLabel: {
    id: 'variantLabel',
    label: 'Body',
    description: 'The name of the variant.',
    type: FieldType.HTML,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  clientLabel: z.string(),
  flowLabel: z.string(),
  variantLabel: z.optional(z.string()),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
