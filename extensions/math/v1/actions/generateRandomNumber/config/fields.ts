import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '../../../../../../lib/types'

export const fields = {
  min: {
    id: 'min',
    label: 'Minimum number',
    description:
      'The minimum number in the range (INCLUSIVE). Should be an integer.',
    required: true,
    type: FieldType.NUMERIC,
  },
  max: {
    id: 'max',
    label: 'Maximum number',
    description:
      'The maximum end of the range (INCLUSIVE). Should be an integer.',
    required: true,
    type: FieldType.NUMERIC,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  min: z.coerce.number().int(),
  max: z.coerce.number().int(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
