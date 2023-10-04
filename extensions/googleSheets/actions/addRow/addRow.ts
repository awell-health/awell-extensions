import { validate, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type AxiosError } from 'axios'
import { z } from 'zod'
import { settingsSchema } from '../../validation'
import { type settings } from '../../settings'
import { google } from 'googleapis'
import {
  isAxiosError,
  isZodError,
  parseAxiosError,
  parseUnknowError,
  parseZodError,
} from '../../utils'
import { fields, fieldsValidationSchema } from './config'

export const addRow: Action<typeof fields, typeof settings> = {
  key: 'addRow',
  title: 'Add row',
  description: '#',
  category: Category.DATA,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const { settings, fields } = validate({
        schema: z.object({
          fields: fieldsValidationSchema,
          settings: settingsSchema,
        }),
        payload,
      })
      const sheets = google.sheets({
        version: 'v4',
        auth: settings.apiKey,
      })

      await sheets.spreadsheets.values.append({
        spreadsheetId: fields.spreadsheetId,
        range: fields.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: fields.values as [],
        },
      })

      await onComplete()
    } catch (error) {
      console.log(error)
      let parsedError

      if (isZodError(error)) {
        parsedError = parseZodError(error)
      } else if (isAxiosError(error)) {
        parsedError = parseAxiosError(error as AxiosError)
      } else {
        parsedError = parseUnknowError(error as Error)
      }
      await onError({
        events: [parsedError],
      })
    }
  },
}
