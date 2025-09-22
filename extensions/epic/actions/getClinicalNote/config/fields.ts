import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  resourceId: {
    id: 'resourceId',
    label: 'Document reference resource ID',
    description: 'Document reference resource ID of the clinical note',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  resourceId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
