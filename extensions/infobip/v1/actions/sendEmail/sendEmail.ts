import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { isEmpty } from 'lodash'
import { infobipErrorToActivityEvent, isInfobipError } from '../../client/error'
import { InfobipClient } from '../../client'

export const sendEmail: Action<typeof fields, typeof settings> = {
  key: 'sendEmail',
  title: 'Send email',
  description: 'Sends email using Infobip',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { baseUrl, apiKey, fromEmail },
        fields: { from, to, subject, content },
      } = validate({
        schema: z
          .object({
            settings: SettingsValidationSchema,
            fields: FieldsValidationSchema,
          })
          .superRefine((value, ctx) => {
            if (
              isEmpty(value.fields.from) &&
              isEmpty(value.settings.fromEmail)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                fatal: true,
                message:
                  '"From" email is missing in both settings and in the action fields.',
              })
            }
          }),
        payload,
      })

      const client = new InfobipClient({ baseUrl, apiToken: apiKey })

      await client.emailApi.send({
        from: from ?? fromEmail,
        to: [to],
        subject,
        html: content,
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
