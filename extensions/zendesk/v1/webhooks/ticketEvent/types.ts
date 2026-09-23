import { z } from 'zod'

/**
 * Zendesk can invoke a webhook in two mutually exclusive ways:
 *
 * 1. Connected to a trigger or automation. The admin authors the JSON body
 *    themselves using placeholders, so there is no fixed shape. We define a
 *    minimal contract: `ticket_id` is required, `event_type` is an optional
 *    label, and a set of well-known optional keys (see `zTriggerWebhookPayload`)
 *    is used to populate data points when the ticket cannot be fetched from
 *    the Zendesk API. Any other keys are passed through on the `payload`
 *    data point.
 *    https://developer.zendesk.com/documentation/webhooks/creating-and-monitoring-webhooks/
 *
 * 2. Subscribed to Zendesk ticket events (`zen:event-type:ticket.*`). Zendesk
 *    sends a standard envelope where `detail` is a snapshot of the ticket.
 *    https://developer.zendesk.com/api-reference/webhooks/event-types/ticket-events/
 *
 * The webhook accepts both. In either case the handler first tries to fetch
 * the full ticket from the Zendesk API so the data points do not depend on
 * what the admin chose to include in the body, and falls back to the body
 * when that is not possible.
 */

const zTicketIdentifier = z.union([z.string().trim().min(1), z.number()])
const zStringish = z.union([z.string(), z.number()]).nullish()
/** `{{ticket.tags}}` renders as a space-separated string; events send an array. */
const zTags = z.union([z.array(z.string()), z.string()]).nullish()

export const zTriggerWebhookPayload = z
  .object({
    ticket_id: zTicketIdentifier,
    event_type: z.string().optional(),
    subject: z.string().nullish(),
    title: z.string().nullish(),
    description: z.string().nullish(),
    status: z.string().nullish(),
    priority: z.string().nullish(),
    type: z.string().nullish(),
    tags: zTags,
    external_id: z.string().nullish(),
    requester_id: zStringish,
    requester_name: z.string().nullish(),
    requester_email: z.string().nullish(),
    assignee_id: zStringish,
    group_id: zStringish,
    organization_id: zStringish,
    channel: z.string().nullish(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    ticket_url: z.string().nullish(),
    url: z.string().nullish(),
  })
  .passthrough()

export type TriggerWebhookPayload = z.infer<typeof zTriggerWebhookPayload>

export const ZENDESK_TICKET_EVENT_TYPE_PREFIX = 'zen:event-type:ticket.'

export const zZendeskTicketEventDetail = z
  .object({
    id: zTicketIdentifier,
    subject: z.string().nullish(),
    description: z.string().nullish(),
    status: z.string().nullish(),
    priority: z.string().nullish(),
    type: z.string().nullish(),
    tags: zTags,
    external_id: z.string().nullish(),
    requester_id: zStringish,
    assignee_id: zStringish,
    group_id: zStringish,
    organization_id: zStringish,
    via: z.object({ channel: z.string().nullish() }).passthrough().nullish(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
  })
  .passthrough()

export const zZendeskTicketEventPayload = z
  .object({
    type: z.string().startsWith(ZENDESK_TICKET_EVENT_TYPE_PREFIX),
    detail: zZendeskTicketEventDetail,
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

export const isZendeskTicketEvent = (
  payload: TicketEventWebhookPayload,
): payload is ZendeskTicketEventPayload =>
  zZendeskTicketEventPayload.safeParse(payload).success

/**
 * Normalises either payload shape to the ticket ID and an event label.
 * Zendesk ticket events take precedence; anything else is treated as a
 * trigger body.
 */
export const resolveTicketEvent = (
  payload: TicketEventWebhookPayload,
): { ticketId: string; eventType: string } => {
  if (isZendeskTicketEvent(payload)) {
    return {
      ticketId: String(payload.detail.id).trim(),
      eventType: payload.type,
    }
  }

  const trigger = zTriggerWebhookPayload.parse(payload)

  return {
    ticketId: String(trigger.ticket_id).trim(),
    eventType: trigger.event_type ?? TRIGGER_EVENT_TYPE,
  }
}
