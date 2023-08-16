import { z } from 'zod'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import {
  SendbirdClient,
  isSendbirdChatError,
  sendbirdChatErrorToActivityEvent,
} from '../../client'

export const deactivateUser: Action<typeof fields, typeof settings> = {
  key: 'deactivateUser',
  title: 'Deactivate user',
  description: 'Deactivates a user using the Chat API.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { applicationId, chatApiToken, deskApiToken },
        fields: { userId, leaveAllGroupChannelsUponDeactivation },
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

      await client.chatApi.updateUser({
        user_id: userId,
        is_active: false,
        leave_all_when_deactivated: leaveAllGroupChannelsUponDeactivation,
      })

      await onComplete()
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
