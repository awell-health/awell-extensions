import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import BrazeApi from '../../client'

export const sendEmail: Action<typeof fields, typeof settings> = {
  key: 'sendEmail',
  title: 'Send email',
  description: 'Send email via Braze',
  category: Category.COMMUNICATION,
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { apiUrl, apiKey },
        fields: { appId, from, body },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const brazeApi = new BrazeApi({ apiUrl, apiKey })
      const response = await brazeApi.sendEmail({
        appId,
        from,
        body,
      })

      await onComplete({
        data_points: {
          dispatchId: response.dispatch_id,
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
