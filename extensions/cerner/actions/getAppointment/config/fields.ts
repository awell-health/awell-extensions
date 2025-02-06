import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  resourceId: {
    id: 'resourceId',
    label: 'Patient resource ID',
    description: 'The resource ID of the patient',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  resourceId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
