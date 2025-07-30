import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { AxiosError } from 'axios'
import { ZodError } from 'zod'

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
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, freshdeskSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
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
            message: `Ticket to update:\n${JSON.stringify(ticketToUpdate.data, null, 2)}`,
          }),
          addActivityEventLog({
            message: `Ticket updated successfully with the following fields:\n${JSON.stringify(requestBody, null, 2)}`,
          }),
        ],
      })
    } catch (error) {
      // Some errors we want to handle explicitly for more human-readable logging
      if (error instanceof ZodError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: { category: 'WRONG_INPUT', message: error.message },
            },
          ],
        })
      } else if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.response?.status === 404) {
          await onError({
            events: [
              addActivityEventLog({
                message: 'Ticket to update not found (404)',
              }),
            ],
          })
        }
        if (err.response?.status === 400) {
          await onError({
            events: [
              addActivityEventLog({
                message: `Bad request (400): ${JSON.stringify(err.response?.data, null, 2)}`,
              }),
            ],
          })
        }
      } else {
        await onError({
          events: [
            addActivityEventLog({
              message: `Error: ${JSON.stringify(error, null, 2)}`,
            }),
          ],
        })
      }
    }
  },
}
