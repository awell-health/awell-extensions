import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import {
  SendbirdClient,
  isSendbirdChatError,
  sendbirdChatErrorToActivityEvent,
} from '../../client'
import { DEFAULT_PROFILE_URL } from '../../constants'
import { isEmpty } from 'lodash'

export const createUser: Action<typeof fields, typeof settings> = {
  key: 'createUser',
  title: 'Create user',
  description: 'Creates a user using the Chat API.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { applicationId, chatApiToken, deskApiToken },
        fields: { userId, metadata, issueAccessToken, profileUrl },
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

      const res = await client.chatApi.createUser({
        user_id: userId,
        nickname: parseNickname(payload),
        metadata,
        issue_access_token: issueAccessToken,
        profile_url: profileUrl ?? DEFAULT_PROFILE_URL,
      })

      await onComplete({ data_points: { userId: res.data.user_id } })
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
      } else if (isSendbirdChatError(err)) {
        const events = sendbirdChatErrorToActivityEvent(err)
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

const parseNickname = (payload: any): string => {
  const nickname: string = payload.fields.nickname
  if (!isEmpty(nickname)) return nickname

  const firstName = payload.patient.profile?.first_name
  const lastName = payload.patient.profile?.last_name

  if (isEmpty(nickname) && isEmpty(firstName) && isEmpty(lastName)) {
    throw new Error(
      'Nickname is not specified, and both first name and last name are unknown.'
    )
  }

  return `${firstName as string} ${lastName as string}`
}
