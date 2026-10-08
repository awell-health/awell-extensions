import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const fields = {
  careFlowIds: {
    id: 'careFlowIds',
    label: 'Care flow ID(s)',
    description:
      'The paused care flow ID(s) to resume. You can resume multiple care flows at once by separating the IDs with a comma. A paused care flow cannot run actions, so this must be a different care flow than the one this action runs in.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  careFlowIds: z
    .string()
    .transform((str) => str.replace(/\s/g, ''))
    .pipe(z.string().min(1, 'At least one care flow ID is required'))
    .transform((str) => str.split(',')),
} satisfies Record<keyof typeof fields, ZodType>)
