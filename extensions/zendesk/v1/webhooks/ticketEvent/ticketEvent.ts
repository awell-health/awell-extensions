import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { isAxiosError } from 'axios'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { makeAPIClient } from '../../client'
import { isZendeskApiError } from '../../client/error'
import {
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
  payload: {
    key: 'payload',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const ticketEvent: Webhook<
  keyof typeof dataPoints,
  TicketEventWebhookPayload,
  typeof settings
> = {
  key: 'ticketEvent',
  description:
    'Starts a care flow when Zendesk sends a webhook about a ticket. Works with a webhook connected to a trigger or automation (JSON body must contain "ticket_id", optionally "event_type") and with a webhook subscribed to Zendesk ticket events (zen:event-type:ticket.*). The full ticket, including requester name and email, is fetched from the Zendesk API and exposed as data points.',
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

    const parsedSettings = SettingsValidationSchema.safeParse(settings)

    if (!parsedSettings.success) {
      await onError({
        response: {
          statusCode: 400,
          message: JSON.stringify(parsedSettings.error.issues, null, 2),
        },
      })
      return
    }

    const { ticketId, eventType } = resolveTicketEvent(parsedPayload.data)
    const client = makeAPIClient(parsedSettings.data)

    helpers.log({ ticketId, eventType }, 'Zendesk ticket event received')

    try {
      const response = await client.getTicket(ticketId)

      await onSuccess({
        data_points: {
          ...ticketToDataPoints({
            response,
            subdomain: parsedSettings.data.subdomain,
          }),
          eventType,
          payload: JSON.stringify(payload),
        },
      })
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        await onError({
          response: {
            statusCode: 404,
            message: `Ticket ${ticketId} was not found in Zendesk`,
          },
        })
        return
      }

      if (isZendeskApiError(err)) {
        await onError({
          response: {
            statusCode: 502,
            message: `Failed to retrieve ticket ${ticketId} from Zendesk: ${JSON.stringify(err.response?.data)}`,
          },
        })
        return
      }

      throw err
    }
  },
}

export type TicketEvent = typeof ticketEvent
