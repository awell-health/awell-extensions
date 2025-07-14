import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { type TicketCreatedWebhookPayload } from './types'
import { zTicketCreatedWebhookPayload } from './types'

const dataPoints = {
  ticketId: {
    key: 'ticketId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const ticketCreated: Webhook<
  keyof typeof dataPoints,
  TicketCreatedWebhookPayload,
  typeof settings
> = {
  key: 'ticketCreated',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings },
    onSuccess,
    onError,
  }) => {
    const parsedPayload = zTicketCreatedWebhookPayload.safeParse(payload)

    if (!parsedPayload.success) {
      await onError({
        response: {
          statusCode: 400,
          message: JSON.stringify(parsedPayload.error, null, 2),
        },
      })
      return
    }

    await onSuccess({
      data_points: {
        ticketId: parsedPayload.data.freshdesk_webhook.ticket_id,
      },
    })
  },
}

export type TicketCreated = typeof ticketCreated
