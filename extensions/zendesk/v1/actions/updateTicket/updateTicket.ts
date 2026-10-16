import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { preserveBlankLines } from './config/fields'
import { type UpdateTicketInput } from '../../client/types'
import { makeAPIClient } from '../../client'
import {
  isZendeskApiError,
  zendeskApiErrorToActivityEvent,
} from '../../client/error'
import { isEmpty, isNil } from 'lodash'

export const updateTicket: Action<typeof fields, typeof settings> = {
  key: 'updateTicket',
  title: 'Update ticket',
  description: 'Updates an existing support ticket in Zendesk',
  category: Category.CUSTOMER_SUPPORT,
  fields,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      const {
        settings,
        fields: {
          ticket_id,
          comment,
          public: isPublic,
          priority,
          status,
          add_tags,
          remove_tags,
        },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = makeAPIClient(settings)

      const updateData: UpdateTicketInput = {
        ...(!isNil(comment) &&
          !isEmpty(comment.trim()) && {
            comment: {
              body: preserveBlankLines(comment),
              public: isPublic ?? true,
            },
          }),
        ...(!isNil(priority) && { priority }),
        ...(!isNil(status) && { status }),
        // Append / remove only; existing tags are never replaced wholesale.
        ...(!isNil(add_tags) && { additional_tags: add_tags }),
        ...(!isNil(remove_tags) && { remove_tags }),
      }

      helpers.log({ updateData }, 'Updating Zendesk ticket')
      await client.updateTicket(ticket_id.toString(), updateData)

      await onComplete({})
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
