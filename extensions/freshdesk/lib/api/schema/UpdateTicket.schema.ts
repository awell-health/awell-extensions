import { z } from 'zod'
import {
  TicketPrioritySchema,
  TicketSourceSchema,
  TicketStatusSchema,
  TicketSchema,
} from './atoms'

export const UpdateTicketInputSchema = z.object({
  name: z.string().optional(),
  requester_id: z.number().optional(),
  email: z.string().email().optional(),
  facebook_id: z.string().optional(),
  phone: z.string().optional(),
  twitter_id: z.string().optional(),
  unique_external_id: z.string().optional(),
  subject: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  description: z.string().optional(),
  responder_id: z.number().optional(),
  attachments: z.array(z.unknown()).optional(),
  custom_fields: z.record(z.string(), z.string()).optional(),
  due_by: z.string().optional(),
  email_config_id: z.number().optional(),
  fr_due_by: z.string().optional(),
  group_id: z.number().optional(),
  parent_id: z.number().optional(),
  product_id: z.number().optional(),
  source: TicketSourceSchema.optional(),
  tags: z.array(z.string()).optional(),
  company_id: z.number().optional(),
  internal_agent_id: z.number().optional(),
  internal_group_id: z.number().optional(),
  lookup_parameter: z.string().optional(),
})

export type UpdateTicketInputType = z.infer<typeof UpdateTicketInputSchema>

export const UpdateTicketResponseSchema = TicketSchema

export type UpdateTicketResponseType = z.infer<
  typeof UpdateTicketResponseSchema
>
