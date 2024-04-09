import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  appointmentId: {
    id: 'appointmentId',
    label: 'Appointment ID',
    description: 'The appointment ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  appointmentId: z.string().nonempty({
    message: 'Missing "Appointment ID"',
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
