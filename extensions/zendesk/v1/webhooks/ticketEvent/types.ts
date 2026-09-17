import { z } from 'zod'

/**
 * Zendesk can invoke a webhook in two mutually exclusive ways:
 *
 * 1. Connected to a trigger or automation. The admin authors the JSON body
 *    themselves using placeholders, so there is no fixed shape. We define a
 *    minimal contract: `ticket_id` is required, `event_type` is an optional
 *    label, and any other keys are passed through on the `payload` data point.
 *    https://developer.zendesk.com/documentation/webhooks/creating-and-monitoring-webhooks/
 *
 * 2. Subscribed to Zendesk ticket events (`zen:event-type:ticket.*`). Zendesk
 *    sends a standard envelope where `detail` is a snapshot of the ticket.
 *    https://developer.zendesk.com/api-reference/webhooks/event-types/ticket-events/
 *
 * The webhook accepts both. In either case the handler fetches the full ticket
 * from the Zendesk API so the data points do not depend on what the admin
 * chose to include in the body.
 */

const zTicketIdentifier = z.union([z.string().trim().min(1), z.number()])

export const zTriggerWebhookPayload = z
  .object({
    ticket_id: zTicketIdentifier,
    event_type: z.string().optional(),
  })
  .passthrough()

export type TriggerWebhookPayload = z.infer<typeof zTriggerWebhookPayload>

export const ZENDESK_TICKET_EVENT_TYPE_PREFIX = 'zen:event-type:ticket.'

export const zZendeskTicketEventPayload = z
  .object({
    type: z.string().startsWith(ZENDESK_TICKET_EVENT_TYPE_PREFIX),
    detail: z.object({ id: zTicketIdentifier }).passthrough(),
    event: z.unknown().optional(),
    id: z.string().optional(),
    time: z.string().optional(),
    account_id: z.number().optional(),
  })
  .passthrough()

export type ZendeskTicketEventPayload = z.infer<
  typeof zZendeskTicketEventPayload
>

export const zTicketEventWebhookPayload = z.union([
  zZendeskTicketEventPayload,
  zTriggerWebhookPayload,
])

export type TicketEventWebhookPayload = z.infer<
  typeof zTicketEventWebhookPayload
>

/** Label used on the `eventType` data point for trigger-based webhooks without an `event_type`. */
export const TRIGGER_EVENT_TYPE = 'trigger'

/**
 * Normalises either payload shape to the ticket ID and an event label.
 * Zendesk ticket events take precedence; anything else is treated as a
 * trigger body.
 */
export const resolveTicketEvent = (
  payload: TicketEventWebhookPayload,
): { ticketId: string; eventType: string } => {
  const ticketEvent = zZendeskTicketEventPayload.safeParse(payload)

  if (ticketEvent.success) {
    return {
      ticketId: String(ticketEvent.data.detail.id).trim(),
      eventType: ticketEvent.data.type,
    }
  }

  const trigger = zTriggerWebhookPayload.parse(payload)

  return {
    ticketId: String(trigger.ticket_id).trim(),
    eventType: trigger.event_type ?? TRIGGER_EVENT_TYPE,
  }
}
