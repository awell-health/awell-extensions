import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, buildAttachment } from './config'
import { isEmpty, isNil } from 'lodash'
import { infobipErrorToActivityEvent, isInfobipError } from '../../client/error'
import { InfobipClient } from '../../client'

export const sendEmail: Action<typeof fields, typeof settings> = {
  key: 'sendEmail',
  title: 'Send email',
  description:
    'Sends email using Infobip, optionally with a file attachment (e.g. a PDF from the HTML to PDF action).',
  category: Category.COMMUNICATION,
  fields,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    // The attachment can be a large base64 string; log its length, not its content.
    const { attachmentContent, ...loggableFields } = payload.fields
    helpers.log(
      {
        fields: {
          ...loggableFields,
          attachmentContentLength: isNil(attachmentContent)
            ? 0
            : String(attachmentContent).length,
        },
      },
      'Processing sendEmail',
    )

    try {
      const {
        settings: { baseUrl, apiKey, fromEmail },
        fields: validatedFields,
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
                code: 'custom',
                fatal: true,
                message:
                  '"From" email is missing in both settings and in the action fields.',
              })
            }
          }),
        payload,
      })

      const { from, to, subject, content } = validatedFields
      const attachment = buildAttachment(validatedFields)

      const client = new InfobipClient({ baseUrl, apiToken: apiKey })

      await client.emailApi.send({
        from: from ?? fromEmail,
        to: [to],
        subject,
        html: content,
        ...(attachment !== undefined && { attachment }),
      })

      await onComplete()
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
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
