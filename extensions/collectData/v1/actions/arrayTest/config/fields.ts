import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  stringArray: {
    id: 'stringArray',
    label: 'String Array',
    description: 'Select a data point or enter comma separated strings.',
    type: FieldType.STRING_ARRAY,
    required: true,
    options: {
      dropdownOptions: [
        {
          value: 'one',
          label: 'One',
        },
        {
          value: 'two',
          label: 'Two',
        },
        {
          value: 'three',
          label: 'Three',
        },
      ],
    },
  },
  numericArray: {
    id: 'numericArray',
    label: 'Numeric Array',
    description: 'Select a data point or enter comma separated numbers.',
    type: FieldType.NUMERIC_ARRAY,
    required: true,
    options: {
      dropdownOptions: [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3 },
      ],
    },
  },
  anotherStringArray: {
    id: 'anotherStringArray',
    label: 'String Array',
    description: 'Select a data point or enter comma separated strings.',
    type: FieldType.STRING_ARRAY,
    required: true,
    options: {
      dropdownOptions: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
      ],
    },
  },
  anotherNumericArray: {
    id: 'anotherNumericArray',
    label: 'Numeric Array',
    description: 'Select a data point or enter comma separated numbers.',
    type: FieldType.NUMERIC_ARRAY,
    required: true,
    options: {
      dropdownOptions: [
        { label: 'Option 1', value: 50 },
        { label: 'Option 2', value: 51 },
      ],
    },
  },
} satisfies Record<string, Field>

// the string array is received as a string, so we need to parse it to an array
// the numeric array is received as a string, so we need to parse it to an array

export const FieldsValidationSchema = z.object({
  stringArray: z.string().transform((str) => str.split(',').map((s) => s.trim())),
  numericArray: z.string().transform((str) => str.split(',').map((s) => Number(s.trim()))),
  anotherStringArray: z.string().transform((str) => str.split(',').map((s) => s.trim())),
  anotherNumericArray: z.string().transform((str) => str.split(',').map((s) => Number(s.trim()))),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export const validateActionFields = (
  fields: unknown
): z.infer<typeof FieldsValidationSchema> => {
  const parsedData = FieldsValidationSchema.parse(fields)

  return parsedData
}
