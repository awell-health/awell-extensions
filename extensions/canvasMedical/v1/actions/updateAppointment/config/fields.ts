import { FieldType, type Field } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const fields = {
  appointmentData: {
    id: 'appointmentData',
    label: 'Appointment data',
    description: 'Appointment data',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const fieldsValidationSchema = z.object({
  appointmentData: z.string().nonempty({
    message: 'Missing "Appointment data"',
  }),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
