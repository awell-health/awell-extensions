import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import {
  TicketPriority,
  TicketSource,
  TicketStatus,
} from '../../lib/api/schema/atoms'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const getTicket: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getTicket',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Get ticket',
  description: 'Get a ticket from Freshdesk.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, freshdeskSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const { data } = await freshdeskSdk.getTicket(fields.ticketId)

      const priorityLabel = Object.entries(TicketPriority).find(
        ([, value]) => value === data.priority,
      )?.[0]
      const statusLabel = Object.entries(TicketStatus).find(
        ([, value]) => value === data.status,
      )?.[0]
      const sourceLabel = Object.entries(TicketSource).find(
        ([, value]) => value === data.source,
      )?.[0]

      await onComplete({
        data_points: {
          ticketData: JSON.stringify(data),
          requesterId: String(data.requester_id),
          subject: data.subject,
          type: data.type,
          priorityValue: String(data.priority),
          priorityLabel,
          statusValue: String(data.status),
          statusLabel,
          sourceValue: String(data.source),
          sourceLabel,
          descriptionText: data.description_text,
          descriptionHtml: data.description,
          customFields: JSON.stringify(data.custom_fields),
          tags: JSON.stringify(data.tags),
        },
      })
    } catch (error) {
      // Some errors we want to handle explicitly for more human-readable logging
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.response?.status === 404) {
          await onError({
            events: [
              addActivityEventLog({
                message: 'Ticket not found (404)',
              }),
            ],
          })
          return
        }
        if (err.response?.status === 400) {
          await onError({
            events: [
              addActivityEventLog({
                message: `Bad request (400): ${JSON.stringify(err.response?.data, null, 2)}`,
              }),
            ],
          })
          return
        }
        throw error
      }

      // Throw all other errors
      throw error
    }
  },
}
