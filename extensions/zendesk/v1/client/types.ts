import { z } from 'zod'

export interface CreateTicketInput {
  subject: string
  comment: {
    body: string
  }
  group_id?: number
  priority?: 'urgent' | 'high' | 'normal' | 'low'
  external_id?: string
  tags?: string[]
}

export interface CreateTicketResponse {
  ticket: {
    id: number
    subject: string
    status: string
    created_at: string
    updated_at: string
  }
}

export interface UpdateTicketInput {
  comment?: {
    body: string
  }
  priority?: 'urgent' | 'high' | 'normal' | 'low'
  status?: 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed'
}

/**
 * Loose schema for a Zendesk ticket as returned by the Tickets API.
 * Only the fields we surface as data points are typed; everything else is
 * passed through untouched so the full object can be exposed as JSON.
 * https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/
 */
export const zZendeskTicket = z
  .object({
    id: z.number(),
    url: z.string().nullish(),
    external_id: z.string().nullish(),
    subject: z.string().nullish(),
    raw_subject: z.string().nullish(),
    description: z.string().nullish(),
    status: z.string().nullish(),
    priority: z.string().nullish(),
    type: z.string().nullish(),
    requester_id: z.number().nullish(),
    submitter_id: z.number().nullish(),
    assignee_id: z.number().nullish(),
    group_id: z.number().nullish(),
    organization_id: z.number().nullish(),
    brand_id: z.number().nullish(),
    tags: z.array(z.string()).nullish(),
    custom_fields: z
      .array(z.object({ id: z.number(), value: z.unknown() }).passthrough())
      .nullish(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    via: z.object({ channel: z.string().nullish() }).passthrough().nullish(),
  })
  .passthrough()

export type ZendeskTicket = z.infer<typeof zZendeskTicket>

/**
 * Loose schema for a Zendesk user, as side-loaded on a ticket with `include=users`.
 * https://developer.zendesk.com/api-reference/ticketing/users/users/
 */
export const zZendeskUser = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
    email: z.string().nullish(),
    external_id: z.string().nullish(),
    phone: z.string().nullish(),
    role: z.string().nullish(),
  })
  .passthrough()

export type ZendeskUser = z.infer<typeof zZendeskUser>

export const zGetTicketResponse = z.object({
  ticket: zZendeskTicket,
  /** Present when the ticket is requested with `include=users` */
  users: z.array(zZendeskUser).optional(),
})

export type GetTicketResponse = z.infer<typeof zGetTicketResponse>

export interface ZendeskApiErrorResponse {
  errors: Array<{
    error: {
      resource: string
      field: string
      code: string
      message: string
      details: string
    }
    meta: {
      type: string
      links: {
        more_info: string
      }
    }
  }>
  meta: {
    type: string
    http_status: string
    logref: string
    links: {
      more_info: string
    }
  }
}
