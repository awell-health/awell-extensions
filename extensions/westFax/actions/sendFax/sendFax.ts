import { z } from 'zod'
import { isNil } from 'lodash'
import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { fields } from './config'
import { dataPoints } from './config/dataPoints'
import { FieldsValidationSchema } from './config/fields'

export const sendFax: Action<typeof fields, typeof settings> = {
  key: 'sendFax',
  category: Category.COMMUNICATION,
  title: 'SendFax',
  description: 'Send fax with WestFax.',
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = 
    validate({
      schema: z.object({
        settings: SettingsValidationSchema,
        fields: FieldsValidationSchema,
      }),
      payload,
    }) 
    const { productId, feedbackEmail, number, content } = fields
    const { username, password } = settings

    try {
      const blob = new Blob([content], { type: 'text/html' })

      const formData = new FormData()
      formData.append('Username', username)
      formData.append('Password', password)
      formData.append('Cookies', 'false')
      formData.append('ProductId', productId)
      if (!isNil(feedbackEmail)) {
        formData.append('FeedbackEmail', feedbackEmail)
      }
      formData.append('Numbers1', number)
      formData.append('Files0', blob, 'content.html')

      const requestOptions = {
        method: 'POST',
        body: formData,
        headers: {
          "accept-encoding": "",
        }
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
        if (!isNil(jsonResponse.Success) && jsonResponse.Success === false) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'There is a miss configuration in the WestFax settings',
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
                  en: 'There is a miss configuration in the WestFax settings',
                },
                error: {
                  category: 'MISSING_SETTINGS',
                  message: 'Missing username, password or product id',
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
            text: { en: 'WestFax API reported an error' },
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
