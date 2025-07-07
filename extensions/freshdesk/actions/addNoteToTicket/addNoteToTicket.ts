import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'

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
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, freshdeskSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

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
  },
}
