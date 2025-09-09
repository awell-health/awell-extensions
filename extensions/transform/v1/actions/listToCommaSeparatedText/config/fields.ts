import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  list: {
    id: 'list',
    label: 'List',
    description:
      'The list you want to transform to a comma separated text.',
    type: FieldType.STRING_ARRAY,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  // the string array is received as a string in the extension server, so we need to parse it to an array
  list: z.string().transform((str) => str.split(',').map((s) => s.trim())),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
