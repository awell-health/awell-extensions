import { z } from 'zod'
import { isNil } from 'lodash'
import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { fields } from './config'
import { dataPoints } from './config/dataPoints'
import { FieldsValidationSchema } from './config/fields'
import { getFaceSheet } from './facesheets/getFaceSheet'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const sendFax: Action<typeof fields, typeof settings> = {
  key: 'sendFax',
  category: Category.COMMUNICATION,
  title: 'Send fax',
  description: 'Send fax with WestFax.',
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = validate({
      schema: z.object({
        settings: SettingsValidationSchema,
        fields: FieldsValidationSchema,
      }),
      payload,
    })
    const { productId, feedbackEmail, number, content, addFaceSheet } = fields
    const { username, password, faceSheetUrl: defaultFaceSheet } = settings

    try {
      const contentBlob = new Blob([content], { type: 'text/html' })
      const contentFileIndex = addFaceSheet === true ? 1 : 0

      const formData = new FormData()

      formData.append('Username', username)
      formData.append('Password', password)
      formData.append('Cookies', 'false')
      formData.append('ProductId', productId)
      if (!isNil(feedbackEmail)) {
        formData.append('FeedbackEmail', feedbackEmail)
      }
      formData.append('Numbers1', number)
      if (addFaceSheet === true) {
        const faceSheetPdfBuffer = await getFaceSheet(defaultFaceSheet)
        const faceSheetPdfBlob = new Blob([faceSheetPdfBuffer], {
          type: 'application/pdf',
        })

        formData.append('Files0', faceSheetPdfBlob, `facesheet.pdf`)
      }
      formData.append(`Files${contentFileIndex}`, contentBlob, 'content.html')

      const requestOptions = {
        method: 'POST',
        body: formData,
        headers: {
          // zlib cant decompress this requests so we need to set enconding as none
          'accept-encoding': '',
        },
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
          events: [
            addActivityEventLog({
              message: `WestFax accepted the Fax, the ID of the fax is ${String(
                faxId
              )}`,
            }),
          ],
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
                  message: 'Missing username or password',
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
