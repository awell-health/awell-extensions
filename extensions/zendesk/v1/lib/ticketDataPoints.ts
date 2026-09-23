import { type DataPointDefinition } from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import { type GetTicketResponse } from '../client'
import {
  isZendeskTicketEvent,
  type TicketEventWebhookPayload,
  zTriggerWebhookPayload,
} from '../webhooks/ticketEvent/types'

/**
 * Data points derived from a Zendesk ticket. Shared by the "Get ticket"
 * action and the "Ticket event" webhook so both expose the same shape.
 */
export const ticketDataPoints = {
  ticketId: {
    key: 'ticketId',
    valueType: 'number',
  },
  ticketUrl: {
    key: 'ticketUrl',
    valueType: 'string',
  },
  subject: {
    key: 'subject',
    valueType: 'string',
  },
  description: {
    key: 'description',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  priority: {
    key: 'priority',
    valueType: 'string',
  },
  type: {
    key: 'type',
    valueType: 'string',
  },
  tags: {
    key: 'tags',
    valueType: 'strings_array',
  },
  externalId: {
    key: 'externalId',
    valueType: 'string',
  },
  requesterId: {
    key: 'requesterId',
    valueType: 'string',
  },
  requesterName: {
    key: 'requesterName',
    valueType: 'string',
  },
  requesterEmail: {
    key: 'requesterEmail',
    valueType: 'string',
  },
  assigneeId: {
    key: 'assigneeId',
    valueType: 'string',
  },
  groupId: {
    key: 'groupId',
    valueType: 'string',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
  channel: {
    key: 'channel',
    valueType: 'string',
  },
  createdAt: {
    key: 'createdAt',
    valueType: 'date',
  },
  updatedAt: {
    key: 'updatedAt',
    valueType: 'date',
  },
  customFields: {
    key: 'customFields',
    valueType: 'json',
  },
  ticket: {
    key: 'ticket',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export type TicketDataPoints = Record<keyof typeof ticketDataPoints, string>

const toString = (value: unknown): string =>
  isNil(value) ? '' : String(value)

export const getTicketUrl = (
  subdomain: string,
  ticketId: number | string,
): string =>
  `https://${subdomain}.zendesk.com/agent/tickets/${ticketId}`

/**
 * Maps a Show Ticket response (with side-loaded users) to string data points.
 * Every key is always present because the webhook callback requires a value
 * for each declared data point; missing values become empty strings.
 */
export const ticketToDataPoints = ({
  response: { ticket, users },
  subdomain,
}: {
  response: GetTicketResponse
  subdomain: string
}): TicketDataPoints => {
  const requester = users?.find((user) => user.id === ticket.requester_id)

  return {
    ticketId: String(ticket.id),
    ticketUrl: getTicketUrl(subdomain, ticket.id),
    subject: toString(ticket.subject),
    description: toString(ticket.description),
    status: toString(ticket.status),
    priority: toString(ticket.priority),
    type: toString(ticket.type),
    tags: JSON.stringify(ticket.tags ?? []),
    externalId: toString(ticket.external_id),
    requesterId: toString(ticket.requester_id),
    requesterName: toString(requester?.name),
    requesterEmail: toString(requester?.email),
    assigneeId: toString(ticket.assignee_id),
    groupId: toString(ticket.group_id),
    organizationId: toString(ticket.organization_id),
    channel: toString(ticket.via?.channel),
    createdAt: toString(ticket.created_at),
    updatedAt: toString(ticket.updated_at),
    customFields: JSON.stringify(ticket.custom_fields ?? []),
    ticket: JSON.stringify(ticket),
  }
}

/**
 * Splits `{{ticket.tags}}` (space separated) or a comma separated string into
 * an array; passes arrays through.
 */
const normaliseTags = (tags: string[] | string | null | undefined): string[] => {
  if (isNil(tags)) return []
  if (Array.isArray(tags)) return tags
  return tags
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

const ensureHttps = (url: string): string =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`

/**
 * Builds the ticket data points from the webhook body alone. Used when the
 * ticket cannot be fetched from the Zendesk API (missing or invalid
 * credentials, wrong account, API outage). Only the keys present in the body
 * are populated; everything else is an empty string.
 */
export const payloadToDataPoints = ({
  payload,
  subdomain,
}: {
  payload: TicketEventWebhookPayload
  subdomain: string | undefined
}): TicketDataPoints => {
  if (isZendeskTicketEvent(payload)) {
    const { detail } = payload
    const ticketId = String(detail.id).trim()

    return {
      ticketId,
      ticketUrl: isNil(subdomain) ? '' : getTicketUrl(subdomain, ticketId),
      subject: toString(detail.subject),
      description: toString(detail.description),
      status: toString(detail.status),
      priority: toString(detail.priority),
      type: toString(detail.type),
      tags: JSON.stringify(normaliseTags(detail.tags)),
      externalId: toString(detail.external_id),
      requesterId: toString(detail.requester_id),
      requesterName: '',
      requesterEmail: '',
      assigneeId: toString(detail.assignee_id),
      groupId: toString(detail.group_id),
      organizationId: toString(detail.organization_id),
      channel: toString(detail.via?.channel),
      createdAt: toString(detail.created_at),
      updatedAt: toString(detail.updated_at),
      customFields: '[]',
      ticket: JSON.stringify(detail),
    }
  }

  const trigger = zTriggerWebhookPayload.parse(payload)
  const ticketId = String(trigger.ticket_id).trim()
  const bodyUrl = trigger.ticket_url ?? trigger.url
  const ticketUrl = !isNil(subdomain)
    ? getTicketUrl(subdomain, ticketId)
    : isNil(bodyUrl) || bodyUrl.trim().length === 0
      ? ''
      : ensureHttps(bodyUrl.trim())

  return {
    ticketId,
    ticketUrl,
    subject: toString(trigger.subject ?? trigger.title),
    description: toString(trigger.description),
    status: toString(trigger.status),
    priority: toString(trigger.priority),
    type: toString(trigger.type),
    tags: JSON.stringify(normaliseTags(trigger.tags)),
    externalId: toString(trigger.external_id),
    requesterId: toString(trigger.requester_id),
    requesterName: toString(trigger.requester_name),
    requesterEmail: toString(trigger.requester_email),
    assigneeId: toString(trigger.assignee_id),
    groupId: toString(trigger.group_id),
    organizationId: toString(trigger.organization_id),
    channel: toString(trigger.channel),
    createdAt: toString(trigger.created_at),
    updatedAt: toString(trigger.updated_at),
    customFields: '[]',
    ticket: JSON.stringify(payload),
  }
}
