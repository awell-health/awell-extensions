import { type Action } from '../../../../../lib/types'
import { fields } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { isEmpty, isNil } from 'lodash'
import messagebirdSdk from '../../../common/sdk/messagebirdSdk'

export const sendSms: Action<typeof fields, typeof settings> = {
  key: 'sendSms',
  title: 'Send SMS',
  description: 'Send an SMS.',
  category: Category.COMMUNICATION,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { originator, recipient, body },
      settings: { apiKey, reportUrl },
    } = payload

    try {
      const allRequiredFieldsHaveValues = [originator, recipient, body].every(
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
                message: '`originator`, `recipient`, or `body` is missing',
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

      messagebirdSdk(apiKey).messages.create(
        {
          originator: String(originator),
          recipients: [String(recipient)],
          body: String(body),
          reportUrl,
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
