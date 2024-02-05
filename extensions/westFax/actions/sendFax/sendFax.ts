import { isNil } from 'lodash'
import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields } from './config'
import { dataPoints } from './config/dataPoints'

export const sendFax: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendFax',
  category: Category.COMMUNICATION,
  title: 'Send Fax',
  description: 'Send fax in West Fax.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { product_id, feedback_email, number, content } = fields
    try {
      if (isNil(product_id) || isNil(number) || isNil(content)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message:
                  '`product_id`, `fax_ids` or `feedback_email` is missing',
              },
            },
          ],
        })
        return
      }

      const { username, password } = settings
      if (isNil(username) || isNil(password)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'API requires an Username and password' },
              error: {
                category: 'MISSING_SETTINGS',
                message: '`username` or `password` is missing',
              },
            },
          ],
        })
        return
      }

      const blob = new Blob([content], { type: 'text/html' })

      const formdata = new FormData()
      formdata.append('Username', username)
      formdata.append('Password', password)
      formdata.append('Cookies', 'false')
      formdata.append('ProductId', product_id)
      if (!isNil(feedback_email)) {
        formdata.append('FeedbackEmail', feedback_email)
      }
      formdata.append('Numbers1', number)
      formdata.append('Files0', blob, 'content.html')

      const requestOptions = {
        method: 'POST',
        body: formdata,
      }

      const response = await fetch(
        'https://api2.westfax.com/REST/Fax_SendFax/json',
        requestOptions
      )
      const jsonResponse = await response.json()

      if (!isNil(jsonResponse.Success) && jsonResponse.Success === true) {
        const faxId = jsonResponse.Result

        await onComplete({
          data_points: {
            faxId,
          },
        })
      } else {
        if (
          !isNil(jsonResponse.Success) &&
          jsonResponse.Success === false
        ) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'There is a miss configuration in the West Fax settings',
                },
                error: {
                  category: 'MISSING_FIELDS',
                  message: jsonResponse.InfoString,
                },
              },
            ],
          })
        } else {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'There is a miss configuration in the West Fax settings',
                },
                error: {
                  category: 'MISSING_SETTINGS',
                  message: 'Missing api url or api key',
                },
              },
            ],
          })
        }
      }
    } catch (err) {
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'West Fax API reported an error' },
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
