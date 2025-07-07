import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const updateTicket: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updateTicket',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Update ticket',
  description: 'Update a ticket in Freshdesk.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, freshdeskSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const ticketToUpdate = await freshdeskSdk.getTicket(fields.ticketId)

    const requestBody = {
      subject: fields.subject,
      type: fields.type,
      status: fields.status,
      priority: fields.priority,
      description: fields.description,
      due_by: fields.dueBy,
      tags: fields.tags,
      custom_fields: fields.customFields,
    }

    await freshdeskSdk.updateTicket({
      ticketId: fields.ticketId,
      input: requestBody,
    })

    await onComplete({
      events: [
        addActivityEventLog({
          message: `Ticket to update:\n${JSON.stringify(ticketToUpdate, null, 2)}`,
        }),
        addActivityEventLog({
          message: `Ticket updated successfully with the following fields:\n${JSON.stringify(requestBody, null, 2)}`,
        }),
      ],
    })
  },
}
