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
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, freshdeskSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

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
  },
}
