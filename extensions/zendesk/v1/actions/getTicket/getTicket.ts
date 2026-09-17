import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { isAxiosError } from 'axios'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { makeAPIClient } from '../../client'
import {
  isZendeskApiError,
  zendeskApiErrorToActivityEvent,
} from '../../client/error'
import { ticketToDataPoints } from '../../lib/ticketDataPoints'

export const getTicket: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getTicket',
  title: 'Get ticket',
  description:
    'Retrieves a support ticket from Zendesk, including the requester details.',
  category: Category.CUSTOMER_SUPPORT,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      const {
        settings,
        fields: { ticket_id },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = makeAPIClient(settings)
      const ticketId = String(ticket_id)

      helpers.log({ ticketId }, 'Retrieving Zendesk ticket')
      const response = await client.getTicket(ticketId)

      await onComplete({
        data_points: ticketToDataPoints({
          response,
          subdomain: settings.subdomain,
        }),
      })
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Ticket not found (404)' },
              error: {
                category: 'BAD_REQUEST',
                message: 'Ticket not found in Zendesk',
              },
            },
          ],
        })
        return
      }

      if (isZendeskApiError(err)) {
        const events = zendeskApiErrorToActivityEvent(err)
        await onError({ events })
        return
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to retrieve ticket: ${errorMessage}` },
            error: {
              category: 'SERVER_ERROR',
              message: errorMessage,
            },
          },
        ],
      })
    }
  },
}
