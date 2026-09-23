import {
  type ActivityEvent,
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { isAxiosError } from 'axios'
import { isNil } from 'lodash'
import { type settings, SettingsValidationSchema } from '../../../settings'
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

const describeFetchError = (err: unknown): string => {
  if (isAxiosError(err)) {
    const status = err.response?.status
    if (status === 404) return 'the ticket was not found in the configured Zendesk account (404)'
    if (status === 401 || status === 403)
      return `Zendesk rejected the credentials (${status})`
    if (!isNil(status)) return `Zendesk responded with HTTP ${status}`
    return `the Zendesk API could not be reached (${err.code ?? err.message})`
  }
  return err instanceof Error ? err.message : 'unknown error'
}

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

    const parsedSettings = SettingsValidationSchema.safeParse(settings)

    let ticketData: TicketDataPoints | undefined
    let fallbackReason: string | undefined

    if (!parsedSettings.success) {
      fallbackReason = `the extension settings are incomplete (${parsedSettings.error.issues
        .map((issue) => issue.message)
        .join('; ')})`
    } else {
      try {
        const client = makeAPIClient(parsedSettings.data)
        const response = await client.getTicket(ticketId)
        ticketData = ticketToDataPoints({
          response,
          subdomain: parsedSettings.data.subdomain,
        })
      } catch (err) {
        fallbackReason = describeFetchError(err)
      }
    }

    const ticketFetched = !isNil(ticketData)
    const events: ActivityEvent[] = []

    if (!ticketFetched) {
      const rawSubdomain = settings.subdomain?.trim()
      const subdomain = parsedSettings.success
        ? parsedSettings.data.subdomain
        : isNil(rawSubdomain) || rawSubdomain.length === 0
          ? undefined
          : rawSubdomain

      ticketData = payloadToDataPoints({
        payload: parsedPayload.data,
        subdomain,
      })

      const message = `Ticket ${ticketId} could not be fetched from Zendesk because ${fallbackReason ?? 'of an unknown error'}. Data points were populated from the webhook payload only.`
      helpers.log({ ticketId, fallbackReason }, message)
      events.push({
        date: new Date().toISOString(),
        text: { en: message },
      })
    }

    await onSuccess({
      data_points: {
        ...(ticketData as TicketDataPoints),
        eventType,
        ticketFetched: String(ticketFetched),
        payload: JSON.stringify(payload),
      },
      ...(events.length > 0 && { events }),
    })
  },
}

export type TicketEvent = typeof ticketEvent
