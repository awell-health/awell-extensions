import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  additionalInstructions: {
    id: 'additionalInstructions',
    label: 'Additional instructions',
    description:
      'Specify additional instructions for summarization, for example format, length, what to focus on etc. If not specified, default instructions will be used.',
    type: FieldType.STRING,
    required: false,
  },
  stakeholder: {
    id: 'stakeholder',
    label: 'Stakeholder',
    description: 'Indicates who the summarization is intended for. Defaults to "Clinician"',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  additionalInstructions: z.string().optional().default(''),
  stakeholder: z
    .string()
    .optional()
    .transform((val): string => {
      if (val === undefined || val === '') return 'Clinician'

      return val
    }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
