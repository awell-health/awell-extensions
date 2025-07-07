import { z, type ZodTypeAny } from 'zod'
import { FieldType, type Field } from '@awell-health/extensions-core'

export const fields = {
  ticketId: {
    id: 'ticketId',
    label: 'Ticket ID',
    description: 'The ID of the ticket to update',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  ticketId: z.string().min(1),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
