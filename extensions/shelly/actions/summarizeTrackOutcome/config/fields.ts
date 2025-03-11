import { type Field, FieldType } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  instructions: {
    id: 'instructions',
    label: 'Instructions',
    description:
      'Specify instructions for the AI to generate the track outcome summary. You can include details about: what outcome to focus on, where to find it in the track, specific forms to analyze, desired length and format, parts of the track to exclude, level of detail for decision paths, etc.',
    type: FieldType.TEXT,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  instructions: z.string().optional().default(''),
} satisfies Record<keyof typeof fields, ZodTypeAny>) 