import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { isEmpty } from 'lodash'
import { infobipErrorToActivityEvent, isInfobipError } from '../../client/error'
import { InfobipClient } from '../../client'

export const sendSms: Action<typeof fields, typeof settings> = {
  key: 'sendSms',
  title: 'Send SMS',
  description: 'Sends SMS using Infobip',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { baseUrl, apiKey, fromPhoneNumber },
        fields: { from, text, to },
      } = validate({
        schema: z
          .object({
            settings: SettingsValidationSchema,
            fields: FieldsValidationSchema,
          })
          .superRefine((value, ctx) => {
            if (
              isEmpty(value.fields.from) &&
              isEmpty(value.settings.fromPhoneNumber)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                fatal: true,
                message:
                  '"From" number is missing in both settings and in the action fields.',
              })
            }
          }),
        payload,
      })

      const client = new InfobipClient({ baseUrl, apiToken: apiKey })

      await client.smsApi.send({
        messages: [
          {
            destinations: [{ to }],
            from: from ?? fromPhoneNumber ?? '',
            text,
          },
        ],
      })

      await onComplete()
    } catch (err) {
      if (isInfobipError(err)) {
        const events = infobipErrorToActivityEvent(err)
        await onError({ events })
      } else {
        // re-throw to be handled in extensions server
        throw err
      }
    }
  },
}
