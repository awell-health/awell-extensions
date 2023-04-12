import { type Action } from '../../../../../lib/types'
import { fields } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { isEmpty, isNil } from 'lodash'
import messagebirdSdk from '../../../common/sdk/messagebirdSdk'

export const sendWhatsAppMessage: Action<typeof fields, typeof settings> = {
  key: 'sendWhatsAppMessage',
  title: 'Send WhatsApp message',
  description: 'Send a WhatsApp message to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { from, to, content },
      settings: { apiKey, reportUrl },
    } = payload

    try {
      const allRequiredFieldsHaveValues = [from, to, content].every(
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
                message: '`from`, `to`, or `content` is missing',
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

      messagebirdSdk(apiKey).conversations.send(
        {
          to: String(to),
          from: String(from),
          type: 'text',
          content: {
            text: String(content),
          },
          reportUrl: String(reportUrl),
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
