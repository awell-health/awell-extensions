import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import TextLineApi from '../../client/textLineApi'
import { isNil } from 'lodash'
import { type Post } from '../../client/schema'

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
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { accessToken },
        fields: { phoneNumber, afterMessageId, departmentId },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const textLineApi = new TextLineApi(accessToken)
      const messages = await textLineApi.getMessages(phoneNumber, afterMessageId, departmentId, 1, 30)

      if (isNil(messages.posts)) {
        await onComplete({
          data_points: {
            allMessages: '',
            numberOfMessages: '0',
            undefined,
          },
        })
      } else {
        // received messages contain a phone number, sent messages will not
        const receivedMessages = messages.posts.filter(
          (p: Post) => !isNil(p.creator.phone_number)
        ).sort((a: Post, b: Post) => {
          return b.created_at - a.created_at;
        });
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
