import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { isNil } from 'lodash'
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
        settings: { baseUrl, apiKey, fromEmail, replyTo: settingsReplyTo },
        fields: { from, to, subject, content, replyTo },
      } = validate({
        schema: z
          .object({
            settings: SettingsValidationSchema,
            fields: FieldsValidationSchema,
          })
          .superRefine((value, ctx) => {
            if (isNil(value.fields.from) && isNil(value.settings.fromEmail)) {
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
        to: [to],
        from: from ?? fromEmail,
        html: content,
        subject,
        replyTo: replyTo ?? settingsReplyTo,
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
