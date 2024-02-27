import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { FieldsValidationSchema, fields } from './config'
import TextLineApi from '../../textLineApi'

export const sendSms: Action<typeof fields, typeof settings> = {
  key: 'sendSms',
  title: 'Send SMS (with from number)',
  description:
    'Send a text message from a given telephone number to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { accessToken },
        fields: { recipient, message },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      // TODO do we need to call authentication before each request or is access token enough?

      // TODO do the request and handle the response
      const textLineApi = new TextLineApi(accessToken)
      const sentMessageResponse = await textLineApi.sendMessage({
        recipient,
        content: message,
      })
      await onComplete({
        data_points: {
          sentMessageResponse: JSON.stringify(sentMessageResponse),
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
