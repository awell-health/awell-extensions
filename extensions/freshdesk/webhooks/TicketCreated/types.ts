import { z } from 'zod'

/**
 * Problem:
 * Freshdesk allows their users to define a custom webhook payload.
 * This means there's no "standard" webhook payload and it's not possible to define a "standard" schema for it.
 *
 * Alternative 1:
 * If a customer wants to use a webhook-based integration with Freshdesk, we register the webhook
 * in a private extension and define a custom contract/schema together with the customer and use that instead.
 *
 * Alternative 2:
 * We try to define a schema for the webhook payload that is flexible enough to handle all possible payloads.
 * Haven't attempted this yet.
 *
 * See https://support.freshdesk.com/support/solutions/articles/132589-using-webhooks-in-automation-rules
 */

export const zTicketCreatedWebhookPayload = z.object({
  freshdesk_webhook: z.object({
    ticket_id: z.string(),
  }),
})
export type TicketCreatedWebhookPayload = z.infer<
  typeof zTicketCreatedWebhookPayload
>
