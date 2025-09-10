import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  NumericIdSchema,
} from '@awell-health/extensions-core'

export const fields = {
  ticketId: {
    label: 'Ticket ID',
    id: 'ticketId',
    type: FieldType.NUMERIC,
    required: true,
    description: 'The ID of the ticket to delete.',
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  ticketId: NumericIdSchema,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
