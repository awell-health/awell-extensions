import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  leadId: {
    id: 'leadId',
    label: 'Lead ID',
    description: 'The ID of the lead to get',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  leadId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
