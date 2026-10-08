import { z } from 'zod'
import { type Action, Category, validate } from '@awell-health/extensions-core'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, buildAttachment, dataPoints } from './config'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'
import { isEmpty, isNil } from 'lodash'
import { infobipErrorToActivityEvent, isInfobipError } from '../../client/error'
import { InfobipClient } from '../../client'

export const sendEmail: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendEmail',
  title: 'Send email',
  description:
    'Sends email using Infobip, optionally with a file attachment (e.g. a PDF from the HTML to PDF action).',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
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

      const res = await client.emailApi.send({
        from: from ?? fromEmail,
        to: [to],
        subject,
        html: content,
        ...(attachment !== undefined && { attachment }),
      })

      /**
       * Infobip's 200 means "accepted", not "delivered". Surface the identifiers
       * so the message can be traced in Infobip's logs without guessing.
       */
      const first = res?.data?.messages?.[0]
      // Infobip's spec types these as strings; coerce anyway so a numeric id
      // can never land in a string data point.
      const bulkId = isNil(res?.data?.bulkId) ? '' : String(res.data.bulkId)
      const messageId = isNil(first?.messageId) ? '' : String(first.messageId)
      const messageStatus = isNil(first?.status?.name ?? first?.status?.groupName)
        ? ''
        : String(first?.status?.name ?? first?.status?.groupName)
      const statusText = [first?.status?.groupName, first?.status?.name]
        .filter((v) => !isNil(v) && !isEmpty(String(v)))
        .map(String)
        .join(' / ')

      await onComplete({
        data_points: { bulkId, messageId, messageStatus },
        events: [
          addActivityEventLog({
            message: `Infobip accepted the request (bulk ID ${bulkId}, message ID ${messageId}${
              statusText !== '' ? `, status ${statusText}` : ''
            }). Acceptance is not delivery; check Infobip logs by message ID for the outcome.`,
          }),
        ],
      })
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
