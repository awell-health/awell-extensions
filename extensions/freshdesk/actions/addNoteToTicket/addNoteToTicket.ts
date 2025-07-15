import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const addNoteToTicket: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'addNoteToTicket',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Add note to ticket',
  description: 'Add a note to a ticket in Freshdesk.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, freshdeskSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      await freshdeskSdk.addNote({
        ticketId: fields.ticketId,
        input: {
          body: fields.body,
          incoming: fields.incoming,
          notify_emails: fields.notifyEmails,
          private: fields.private,
          user_id: fields.userId,
        },
      })

      await onComplete()
    } catch (error) {
      // Some errors we want to handle explicitly for more human-readable logging
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.response?.status === 404)
          await onError({
            events: [
              addActivityEventLog({
                message: 'Ticket to add note to not found (404)',
              }),
            ],
          })
        return
      }

      // Throw all other errors
      throw error
    }
  },
}
