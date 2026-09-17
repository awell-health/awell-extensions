import { z, type ZodType } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'

export const fields = {
  ticket_id: {
    label: 'Ticket ID',
    id: 'ticket_id',
    type: FieldType.NUMERIC,
    required: true,
    description: 'The ID of the ticket to retrieve.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  ticket_id: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodType>)
