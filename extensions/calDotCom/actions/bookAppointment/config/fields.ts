import { z, type ZodTypeAny } from 'zod'
import { type Field, FieldType } from '@awell-health/extensions-core'

export const fields = {
  calLink: {
    id: 'calLink',
    label: 'Cal Link',
    description:
      'The Cal Link that you want to embed e.g. "john". Just give the username. No need to give the full URL https://cal.com/john.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  calLink: z.string().nonempty(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
