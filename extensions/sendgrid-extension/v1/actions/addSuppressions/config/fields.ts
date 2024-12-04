import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
  validateCommaSeparatedList,
} from '@awell-health/extensions-core'
import { getEmailValidation } from '../../../../../../src/lib/awell'

export const fields = {
  email: {
    id: 'email',
    label: 'Email',
    description: 'The email address you would like to suppress',
    type: FieldType.STRING,
    required: true,
  },
  groups: {
    id: 'groups',
    label: 'Groups',
    description: 'A comma-separated list of group IDs (e.g. `12345, 12346`)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  email: getEmailValidation(),
  groups: validateCommaSeparatedList(
    (value) => NumericIdSchema.safeParse(value).success,
    true
  ).optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
