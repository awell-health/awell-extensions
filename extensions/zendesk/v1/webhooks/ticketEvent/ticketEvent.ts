import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { isAxiosError } from 'axios'
import { isNil } from 'lodash'
import {
  type settings,
  SettingsValidationSchema,
  zSubdomain,
} from '../../../settings'
import { makeAPIClient } from '../../client'
import {
  payloadToDataPoints,
  type TicketDataPoints,
  ticketDataPoints,
  ticketToDataPoints,
} from '../../lib/ticketDataPoints'
import {
  type TicketEventWebhookPayload,
  resolveTicketEvent,
  zTicketEventWebhookPayload,
} from './types'

const dataPoints = {
  ...ticketDataPoints,
  eventType: {
    key: 'eventType',
    valueType: 'string',
  },
  ticketFetched: {
    key: 'ticketFetched',
    valueType: 'boolean',
  },
  payload: {
    key: 'payload',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

/**
 * Fixed descriptions only: the text ends up in a customer-visible activity
 * event, so raw error messages are logged but never surfaced.
 */
const describeFetchError = (err: unknown): string => {
  if (!isAxiosError(err)) return 'of an unexpected error'
  const status = err.response?.status
  if (status === 401 || status === 403)
    return `Zendesk rejected the credentials (HTTP ${status})`
  if (!isNil(status)) return `Zendesk responded with HTTP ${status}`
  return 'the Zendesk API could not be reached'
}

type FetchTicketResult =
  | { status: 'fetched'; data: TicketDataPoints }
  | { status: 'notFound' }
  | { status: 'failed'; reason: string }

export const ticketEvent: Webhook<
  keyof typeof dataPoints,
  TicketEventWebhookPayload,
  typeof settings
> = {
  key: 'ticketEvent',
  description:
    'Starts a care flow when Zendesk sends a webhook about a ticket. Works with a webhook connected to a trigger or automation (JSON body must contain "ticket_id", optionally "event_type" and other ticket fields) and with a webhook subscribed to Zendesk ticket events (zen:event-type:ticket.*). The full ticket, including requester name and email, is fetched from the Zendesk API when the extension settings allow it; otherwise the data points are populated from the webhook body and "ticketFetched" is false.',
  dataPoints,
  onEvent: async ({
    payload: { payload, settings },
    onSuccess,
    onError,
    helpers,
  }) => {
    const parsedPayload = zTicketEventWebhookPayload.safeParse(payload)

    if (!parsedPayload.success) {
      await onError({
        response: {
          statusCode: 400,
          message: `Shape of payload does not match expected shape. Expected either a Zendesk ticket event (with "type" starting with "zen:event-type:ticket." and "detail.id") or a trigger body with a "ticket_id" property.\n\nReceived: ${JSON.stringify(parsedPayload.error.issues, null, 2)}`,
        },
      })
      return
    }

    const { ticketId, eventType } = resolveTicketEvent(parsedPayload.data)
    helpers.log({ ticketId, eventType }, 'Zendesk ticket event received')

    const fetchTicket = async (): Promise<FetchTicketResult> => {
      const parsedSettings = SettingsValidationSchema.safeParse(settings)
      if (!parsedSettings.success) {
        const issues = parsedSettings.error.issues.map((i) => i.message)
        return {
          status: 'failed',
          reason: `the extension settings are incomplete (${issues.join('; ')})`,
        }
      }

      try {
        const client = makeAPIClient(parsedSettings.data)
        const response = await client.getTicket(ticketId)
        return {
          status: 'fetched',
          data: ticketToDataPoints({
            response,
            subdomain: parsedSettings.data.subdomain,
          }),
        }
      } catch (err) {
        // A genuine Zendesk webhook refers to a ticket that exists, so a 404
        // means a misrouted or forged request rather than a reason to fall
        // back to the unverified body.
        if (isAxiosError(err) && err.response?.status === 404)
          return { status: 'notFound' }
        helpers.log(
          { ticketId },
          'Failed to fetch Zendesk ticket',
          err instanceof Error ? err : undefined,
        )
        return { status: 'failed', reason: describeFetchError(err) }
      }
    }

    const result = await fetchTicket()

    if (result.status === 'notFound') {
      await onError({
        response: {
          statusCode: 404,
          message: `Ticket ${ticketId} was not found in Zendesk`,
        },
      })
      return
    }

    const commonDataPoints = {
      eventType,
      ticketFetched: String(result.status === 'fetched'),
      payload: JSON.stringify(payload),
    }

    if (result.status === 'fetched') {
      await onSuccess({
        data_points: { ...result.data, ...commonDataPoints },
      })
      return
    }

    const subdomain = zSubdomain.safeParse(settings.subdomain)
    const message = `Ticket ${ticketId} could not be fetched from Zendesk because ${result.reason}. Data points were populated from the webhook payload only.`
    helpers.log({ ticketId, reason: result.reason }, message)

    await onSuccess({
      data_points: {
        ...payloadToDataPoints({
          payload: parsedPayload.data,
          subdomain: subdomain.success ? subdomain.data : undefined,
        }),
        ...commonDataPoints,
      },
      events: [{ date: new Date().toISOString(), text: { en: message } }],
    })
  },
}

export type TicketEvent = typeof ticketEvent
