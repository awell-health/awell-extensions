import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import TextLineApi from '../../textLineApi'

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
        settings: { accessToken },
        fields: { recipient, page, page_size },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const textLineApi = new TextLineApi(accessToken)
      const messages = await textLineApi.getMessages(recipient, page, page_size)
      const numberOfMessages = messages.posts.length
      const allMessages = messages.posts.map(function (message) {
        return message.body
      })
      const latestMessage =
        numberOfMessages > 0 ? messages.posts[0].body : undefined

      await onComplete({
        data_points: {
          allMessages: JSON.stringify(allMessages),
          numberOfMessages: String(numberOfMessages),
          latestMessage,
        },
      })
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
