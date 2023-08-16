import { z } from 'zod'
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
        fields: { userId, metadata, nickname, issueAccessToken, profileUrl },
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
        nickname,
        metadata,
        issue_access_token: issueAccessToken,
        profile_url: profileUrl ?? DEFAULT_PROFILE_URL,
      })

      await onComplete({ data_points: { userId: res.data.user_id } })
    } catch (err) {
      if (isSendbirdChatError(err)) {
        const events = sendbirdChatErrorToActivityEvent(err)
        await onError({ events })
      } else {
        /**
         * re-throw to be handled inside awell-extension-server
         */
        throw err
      }
    }
  },
}
