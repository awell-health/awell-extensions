import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
  NumericIdSchema,
  validateCommaSeparatedList
} from '@awell-health/extensions-core'

export const fields = {
  email: {
    id: 'email',
    label: 'Email',
    description:
      'The email address you would like to remove from the suppression list',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
    required: true,
  },
  groups: {
    id: 'groups',
    label: 'Groups',
    description:
      'A comma-separated list of group IDs (e.g. `12345, 12346`)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  email: z.string().email(),
  groups: validateCommaSeparatedList(
    (value) => NumericIdSchema.safeParse(value).success,
    true
  ).optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
