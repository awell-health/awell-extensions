import { type DataPointDefinition } from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import { type GetTicketResponse } from '../client'

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

export const getTicketUrl = (subdomain: string, ticketId: number): string =>
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
