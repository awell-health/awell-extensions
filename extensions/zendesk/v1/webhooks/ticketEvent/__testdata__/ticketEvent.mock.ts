import {
  type TriggerWebhookPayload,
  type ZendeskTicketEventPayload,
} from '../types'

/** Body an admin would configure on a webhook connected to a Zendesk trigger. */
export const triggerWebhookPayload = {
  ticket_id: '35436',
  event_type: 'kit_retrieval_requested',
  subject: 'Kit retrieval request',
  status: 'open',
  tags: 'kit_retrieval enterprise',
  external_id: 'awell-patient-123',
  requester_name: 'Jane Requester',
  requester_email: 'jane@example.com',
  ticket_url: 'test-company.zendesk.com/agent/tickets/35436',
} satisfies TriggerWebhookPayload

/** Envelope Zendesk sends for a webhook subscribed to ticket events. */
export const zendeskTicketEventPayload = {
  account_id: 123456,
  detail: {
    id: '35436',
    subject: 'Kit retrieval request',
    status: 'open',
    requester_id: '20978392',
    external_id: 'awell-patient-123',
    tags: ['kit_retrieval'],
  },
  event: {},
  id: '01HXYZ0000000000000000ABCD',
  subject: 'zen:ticket:35436',
  time: '2026-09-16T08:30:00Z',
  type: 'zen:event-type:ticket.created',
  zendesk_event_version: '2022-11-06',
} satisfies ZendeskTicketEventPayload
