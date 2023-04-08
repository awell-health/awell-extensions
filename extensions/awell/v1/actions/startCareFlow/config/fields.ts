import { type Field, FieldType } from '../../../../../../lib/types'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  pathwayDefinitionId: {
    id: 'pathwayDefinitionId',
    label: 'Care flow definition ID',
    description: 'The identifier of the care flow definition to start.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  pathwayDefinitionId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
