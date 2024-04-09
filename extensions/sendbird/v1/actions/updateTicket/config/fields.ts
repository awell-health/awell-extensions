import { string, z, type ZodTypeAny } from 'zod'
import {
  type Field,
  FieldType,
  validateCommaSeparatedList,
} from '@awell-health/extensions-core'
import { TicketPriority } from '../../../types'

export const fields = {
  ticketId: {
    label: 'Ticket ID',
    id: 'ticketId',
    type: FieldType.NUMERIC,
    required: true,
    description: "A customer's unique ID.",
  },
  priority: {
    label: 'Priority',
    id: 'priority',
    type: FieldType.STRING,
    required: false,
    description:
      'Specifies the priority of a ticket. Acceptable values are the following: "LOW", "MEDIUM", "HIGH", and "URGENT". Defaults to: "MEDIUM".',
  },
  relatedChannelUrls: {
    label: 'Related channel URLs',
    id: 'relatedChannelUrls',
    type: FieldType.STRING,
    required: false,
    description:
      'A comma-separated string of group channel URLs for reference, where the corresponding customer belongs. Can have up to 3 group channel URLs.',
  },
} satisfies Record<string, Field>

const priorityEnum = z.enum<
  TicketPriority,
  [TicketPriority, ...TicketPriority[]]
>(Object.values(TicketPriority) as [TicketPriority, ...TicketPriority[]])

export const FieldsValidationSchema = z.object({
  ticketId: z.coerce.number(),
  relatedChannelUrls: string(
    validateCommaSeparatedList(
      (value) => z.string().safeParse(value).success,
      false
    )
  ),
  priority: priorityEnum,
} satisfies Record<keyof typeof fields, ZodTypeAny>)
