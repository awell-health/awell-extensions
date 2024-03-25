import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  appointmentId: {
    id: 'appointmentId',
    label: 'Appointment ID',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  appointmentId: z.string(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
