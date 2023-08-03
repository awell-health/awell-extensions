import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { fromUnixTime } from 'date-fns'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import {
  SendbirdClient,
  isSendbirdError,
  sendbirdErrorToActivityEvent,
} from '../../client'

export const getUser: Action<typeof fields, typeof settings> = {
  key: 'getUser',
  title: 'Get user',
  description: 'Gets user using Chat API.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { applicationId, chatApiToken, deskApiToken },
        fields: { userId },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = new SendbirdClient({
        applicationId,
        chatApiToken,
        deskApiToken,
      })

      const res = await client.chatApi.getUser(userId)

      await onComplete({
        data_points: {
          nickname: res.data.nickname,
          accessToken: res.data.access_token,
          isActive: String(res.data.is_active),
          createdAt: fromUnixTime(res.data.created_at).toISOString(),
          lastSeenAt: fromUnixTime(res.data.last_seen_at).toISOString(),
          hasEverLoggedIn: String(res.data.has_ever_logged_in),
          metadata: JSON.stringify(res.data.metadata),
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
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (isSendbirdError(err)) {
        const events = sendbirdErrorToActivityEvent(err)
        await onError({ events })
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
