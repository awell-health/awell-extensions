import { type Action } from '../../../../../lib/types'
import { fields } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { isEmpty, isNil } from 'lodash'
import messagebirdSdk from '../../../common/sdk/messagebirdSdk'
import { type voice, type languages } from 'messagebird/types/voice_messages'

export const sendVoiceMessage: Action<typeof fields, typeof settings> = {
  key: 'sendVoiceMessage',
  title: 'Send voice message',
  description: 'Send a voice message.',
  category: Category.COMMUNICATION,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { originator, recipient, body, language, voice },
      settings: { apiKey },
    } = payload

    try {
      const allRequiredFieldsHaveValues = [recipient, body].every(
        (field) => !isEmpty(field)
      )

      if (!allRequiredFieldsHaveValues) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`recipient`, or `body` is missing',
              },
            },
          ],
        })
        return
      }

      if (isNil(apiKey)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Missing an API key' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing an API key',
              },
            },
          ],
        })
        return
      }

      messagebirdSdk(apiKey).voice_messages.create(
        {
          recipients: [String(recipient)],
          body: String(body),
          language: language as languages,
          voice: voice as voice,
          originator,
        },
        function (error, response) {
          if (error != null) {
            void onError({
              events: [
                {
                  date: new Date().toISOString(),
                  text: { en: 'Exception when calling the MessageBird API' },
                  error: {
                    category: 'SERVER_ERROR',
                    message: error.message,
                  },
                },
              ],
            })
          } else {
            void onComplete()
          }
        }
      )
    } catch (err) {
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
