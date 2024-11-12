import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import TextLineApi from '../../client/textLineApi'
import { type SendMessageResponse } from '../../client/schema'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const sendSms: Action<typeof fields, typeof settings> = {
  key: 'sendSms',
  title: 'Send SMS',
  description:
    'Send a text message from a given telephone number to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { accessToken },
        fields: { recipient, message, departmentId },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const textLineApi = new TextLineApi(accessToken)
      const response: SendMessageResponse = await textLineApi.sendMessage(
        message,
        recipient,
        departmentId
      )

      const conversationId = response.post.conversation_uuid
      const messageId = response.post.uuid

      await onComplete({
        data_points: {
          conversationId,
          messageId,
        },
        events: [
          addActivityEventLog({
            message: `TextLine accepted the request to send the message. Conversation ID: ${conversationId}, Message ID: ${messageId}.`,
          }),
        ],
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
