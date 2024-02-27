import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import TextLineApi from '../../textLineApi'
import { isNil } from 'lodash'
import { type Post } from '../../schema'

export const getMessages: Action<typeof fields, typeof settings> = {
  key: 'getMessages',
  title: 'Get messages',
  description: `
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
        settings: { email, password, apiKey },
        fields: { phoneNumber, page, pageSize },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const textLineApi = new TextLineApi(email, password, apiKey)
      const messages = await textLineApi.getMessages(phoneNumber, page, pageSize)

      if(isNil(messages.posts)){
        await onComplete({
          data_points: {
            allMessages: '',
            numberOfMessages: '0',
            undefined,
          },
        })
      } else {
        // received sms contain the phone number, everything else will not
        const receivedMessages = messages.posts.filter((p: Post) => !isNil(p.creator.phone_number));
        const numberOfMessages = receivedMessages.length
        const allMessages = receivedMessages.map(function (p: Post) {
          return p.body
        })
        const latestMessage =
          numberOfMessages > 0 ? receivedMessages[0].body : undefined

        await onComplete({
          data_points: {
            allMessages: JSON.stringify(allMessages),
            numberOfMessages: String(numberOfMessages),
            latestMessage,
          },
        })
      }
     
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
