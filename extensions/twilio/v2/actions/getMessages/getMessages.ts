import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import twilioSdk from '../../../common/sdk/twilio'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { type MessageListInstanceOptions } from 'twilio/lib/rest/api/v2010/account/message'

export const getMessages: Action<typeof fields, typeof settings> = {
  key: 'getMessages',
  title: 'Get messages',
  description:
    `
    Get a list of text messages matching the given criteria.
    You can also filter the Messages by providing one of the allowed filters.
    `,
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { accountSid, authToken},
        fields: { recipient, from, date_sent, date_sent_after, date_sent_before, page_size },
      } = validate({
        schema: z
          .object({
            settings: SettingsValidationSchema,
            fields: FieldsValidationSchema,
          }),
        payload,
      })

      const client = twilioSdk(accountSid, authToken, {
        region: 'IE1',
        accountSid,
      })

      const params : MessageListInstanceOptions = {
        to: recipient,
        from,
        dateSent: date_sent,
        dateSentAfter: date_sent_after,
        dateSentBefore: date_sent_before,
        pageSize: page_size
      }

      const messages = await client.messages.list(params)
      const numberOfMessages = messages.length
      const allMessages = messages.map(function(message) {
        return message.body;
      });
      const latestMessage = numberOfMessages > 0 ? messages[0].body : undefined

      await onComplete( {data_points: {
        allMessages: JSON.stringify(allMessages),
        numberOfMessages: String(numberOfMessages),
        latestMessage
      }})
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'BAD_REQUEST',
                message: error.message,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
