import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { makeAPIClient } from '../../client'
import {
  isZendeskApiError,
  zendeskApiErrorToActivityEvent,
} from '../../client/error'
import { isNil } from 'lodash'

export const createTicket: Action<typeof fields, typeof settings> = {
  key: 'createTicket',
  title: 'Create ticket',
  description: 'Creates a new support ticket in Zendesk',
  category: Category.CUSTOMER_SUPPORT,
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    try {
      const {
        settings,
        fields: { subject, comment, group_id, priority, external_id, tag },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = makeAPIClient(settings)

      const ticketData = {
        subject,
        comment: { body: comment },
        ...(!isNil(group_id) && { group_id: Number(group_id) }),
        ...(!isNil(priority) && { priority }),
        ...(!isNil(external_id) && { external_id }),
        ...(!isNil(tag) && { tags: [tag] }),
      }

      const response = await client.createTicket(ticketData)

      await onComplete({
        data_points: {
          ticketId: String(response.ticket.id),
          ticketUrl: `https://${settings.subdomain}.zendesk.com/agent/tickets/${response.ticket.id}`,
        },
      })
    } catch (err) {
      if (isZendeskApiError(err)) {
        const events = zendeskApiErrorToActivityEvent(err)
        await onError({ events })
      } else {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: `Failed to create ticket: ${errorMessage}` },
              error: {
                category: 'SERVER_ERROR',
                message: errorMessage,
              },
            },
          ],
        })
      }
    }
  },
}
