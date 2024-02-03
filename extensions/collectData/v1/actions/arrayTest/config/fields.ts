import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  stringArray: {
    id: 'stringArray',
    label: 'String Array',
    description: 'Select a data point or enter comma separated strings.',
    type: FieldType.STRING_ARRAY,
    required: true,
  },
  numericArray: {
    id: 'numericArray',
    label: 'Numeric Array',
    description: 'Select a data point or enter comma separated numbers.',
    type: FieldType.NUMERIC_ARRAY,
    required: true,
  },
  anotherStringArray: {
    id: 'anotherStringArray',
    label: 'String Array',
    description: 'Select a data point or enter comma separated strings.',
    type: FieldType.STRING_ARRAY,
    required: true,
  },
  anotherNumericArray: {
    id: 'anotherNumericArray',
    label: 'Numeric Array',
    description: 'Select a data point or enter comma separated numbers.',
    type: FieldType.NUMERIC_ARRAY,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  stringArray: z.string().array().nonempty(),
  numericArray: z.number().array().nonempty(),
  anotherStringArray: z.string().array().nonempty(),
  anotherNumericArray: z.number().array().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
