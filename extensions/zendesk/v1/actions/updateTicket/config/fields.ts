import { z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  StringType,
  makeStringOptional,
} from '@awell-health/extensions-core'

const priorityEnum = z.enum(['urgent', 'high', 'normal', 'low'])
const statusEnum = z.enum([
  'new',
  'open',
  'pending',
  'hold',
  'solved',
  'closed',
])

export const fields = {
  ticket_id: {
    label: 'Ticket ID',
    id: 'ticket_id',
    type: FieldType.NUMERIC,
    required: true,
    description: 'The ID of the ticket to update.',
  },
  comment: {
    label: 'Comment',
    id: 'comment',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: false,
    description: 'Add a comment to the ticket.',
  },
  priority: {
    label: 'Priority',
    id: 'priority',
    type: FieldType.STRING,
    required: false,
    description: 'The priority level: urgent, high, normal, or low.',
    options: {
      dropdownOptions: Object.values(priorityEnum.enum).map((priority) => ({
        label: priority,
        value: priority,
      })),
    },
  },
  status: {
    label: 'Status',
    id: 'status',
    type: FieldType.STRING,
    required: false,
    description: 'The status: new, open, pending, hold, solved, or closed.',
    options: {
      dropdownOptions: Object.values(statusEnum.enum).map((status) => ({
        label: status,
        value: status,
      })),
    },
  },
} satisfies Record<string, Field>

export const FieldsValidationSchema = z.object({
  ticket_id: z.string().nonempty(),
  comment: z.string().optional(),
  priority: makeStringOptional(priorityEnum),
  status: makeStringOptional(statusEnum),
} satisfies Record<keyof typeof fields, ZodTypeAny>)
