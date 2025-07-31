import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import {
  type settings,
  SettingsValidationSchema,
  FRESHDESK_IDENTIFIER_SYSTEM,
} from '../../settings'
import { type TicketCreatedWebhookPayload } from './types'
import { zTicketCreatedWebhookPayload } from './types'
import { FreshdeskApiClient } from '../../lib/api/client'
import { isNil } from 'lodash'

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
          message: `Shape of payload does not match expected shape.\n\nExpected: ${JSON.stringify(zTicketCreatedWebhookPayload.shape, null, 2)}\n\nReceived: ${JSON.stringify(parsedPayload.error, null, 2)}`,
        },
      })
      return
    }

    const parsedSettings = SettingsValidationSchema.safeParse(settings)

    if (!parsedSettings.success) {
      await onError({
        response: {
          statusCode: 400,
          message: JSON.stringify(parsedSettings.error, null, 2),
        },
      })
      return
    }

    const baseUrl = `https://${parsedSettings.data.domain}.freshdesk.com/api/v2`

    const freshdeskSdk = new FreshdeskApiClient({
      baseUrl,
      apiKey: parsedSettings.data.apiKey,
    })

    const ticket = await freshdeskSdk.getTicket(
      parsedPayload.data.freshdesk_webhook.ticket_id.toString(),
    )
    const requesterId = ticket.data?.requester_id // requester ID is the ID of the Freshdesk contact/patient

    await onSuccess({
      data_points: {
        ticketId: parsedPayload.data.freshdesk_webhook.ticket_id.toString(),
      },
      ...(!isNil(requesterId) && {
        patient_identifier: {
          system: FRESHDESK_IDENTIFIER_SYSTEM,
          value: ticket.data.requester_id.toString(),
        },
      }),
    })
  },
}

export type TicketCreated = typeof ticketCreated
