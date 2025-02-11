import { type Field, FieldType } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  title: {
    id: 'title',
    label: 'Title',
    description: 'The title shown on the success page in Hosted Pages.',
    type: FieldType.STRING,
    required: false,
  },
  subtitle: {
    id: 'subtitle',
    label: 'Subtitle',
    description: 'The subtitle shown on the success page in Hosted Pages.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
