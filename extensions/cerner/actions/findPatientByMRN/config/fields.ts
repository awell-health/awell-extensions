import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  MRN: {
    id: 'MRN',
    label: 'Medical Record Number (MRN)',
    type: FieldType.STRING,
    description: '',
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  MRN: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
