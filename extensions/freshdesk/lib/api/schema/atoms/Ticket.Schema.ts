import { z } from 'zod'
import { TicketPrioritySchema, TicketSourceSchema, TicketStatusSchema } from '.'

export const TicketSchema = z.object({
  cc_emails: z.array(z.string()),
  fwd_emails: z.array(z.string()),
  reply_cc_emails: z.array(z.string()),
  email_config_id: z.number().nullable(),
  fr_escalated: z.boolean(),
  group_id: z.number().nullable(),
  priority: TicketPrioritySchema,
  requester_id: z.number(),
  responder_id: z.number().nullable(),
  source: TicketSourceSchema,
  spam: z.boolean(),
  status: TicketStatusSchema,
  subject: z.string().nullable(),
  company_id: z.number().optional().nullable(),
  id: z.number(),
  type: z.string().nullable(),
  to_emails: z.array(z.string()).nullable(),
  product_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  due_by: z.string().nullable(),
  fr_due_by: z.string().nullable(),
  is_escalated: z.boolean(),
  association_type: z.unknown().nullable(),
  description_text: z.string(),
  description: z.string(),
  custom_fields: z
    .record(z.string(), z.union([z.string(), z.null()]))
    .optional()
    .nullable(),
  tags: z.array(z.string()),
  attachments: z.array(z.unknown()),
})
