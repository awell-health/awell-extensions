import { type TicketCreatedWebhookPayload } from '../types'

export const ticketCreatedPayload = {
  freshdesk_webhook: {
    ticket_id: '20',
  },
} satisfies TicketCreatedWebhookPayload
