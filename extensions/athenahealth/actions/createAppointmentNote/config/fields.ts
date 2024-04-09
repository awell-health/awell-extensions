import { FieldType, type Field } from '@awell-health/extensions-core'
import z, { type ZodTypeAny } from 'zod'

export const fields = {
  appointmentid: {
    id: 'appointmentid',
    label: 'Appointment ID',
    description: '',
    type: FieldType.STRING,
    required: true,
  },
  notetext: {
    id: 'notetext',
    label: 'Note text',
    description: '',
    type: FieldType.TEXT,
    required: true,
  },
  displayonschedule: {
    id: 'displayonschedule',
    label: 'Add note to homepage',
    description: 'Add appointment note to homepage display',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  appointmentid: z.string().min(1),
  notetext: z.string().min(1),
  displayonschedule: z.boolean().optional(),
} satisfies Record<keyof typeof fields, ZodTypeAny>)

export type CreateAppointmentNoteInputType = z.infer<
  typeof FieldsValidationSchema
>
