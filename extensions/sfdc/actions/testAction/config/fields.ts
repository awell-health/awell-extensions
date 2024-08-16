import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  sObject: {
    id: 'sObject',
    label: 'sObject',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  sObject: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
