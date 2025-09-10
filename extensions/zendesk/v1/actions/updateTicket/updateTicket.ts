import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { makeAPIClient } from '../../client'
import { isZendeskApiError, zendeskApiErrorToActivityEvent } from '../../client/error'

export const updateTicket: Action<typeof fields, typeof settings> = {
  key: 'updateTicket',
  title: 'Update ticket',
  description: 'Updates an existing support ticket in Zendesk',
  category: Category.CUSTOMER_SUPPORT,
  fields,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      const {
        settings,
        fields: { ticket_id, comment, priority, status },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = makeAPIClient(settings)

      const updateData: any = {}
      
      if (comment) {
        updateData.comment = { body: comment }
      }
      if (priority) {
        updateData.priority = priority
      }
      if (status) {
        updateData.status = status
      }

      await client.updateTicket(ticket_id, updateData)

      await onComplete({})
    } catch (err) {
      if (isZendeskApiError(err)) {
        const events = zendeskApiErrorToActivityEvent(err)
        await onError({ events })
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: `Failed to update ticket: ${errorMessage}` },
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
