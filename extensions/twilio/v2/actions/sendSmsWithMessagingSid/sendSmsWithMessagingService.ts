import { z } from 'zod'
import twilioSdk from '../../../common/sdk/twilio'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { isNil } from 'lodash'
import { appendOptOutLanguage } from '../../../lib'
import { isTwilioErrorResponse, parseTwilioError } from '../../../lib/errors'

export const sendSmsWithMessagingService: Action<
  typeof fields,
  typeof settings
> = {
  key: 'sendSmsWithMessagingService',
  title: 'Send SMS (with Messaging Service)',
  description:
    'Send a text message from a Messaging Service to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: {
          accountSid,
          authToken,
          messagingServiceSid: defaultMessagingServiceSid,
          addOptOutLanguage,
          optOutLanguage,
          language,
        },
        fields: { recipient, message, messagingServiceSid },
      } = validate({
        schema: z
          .object({
            settings: SettingsValidationSchema,
            fields: FieldsValidationSchema,
          })
          .superRefine((value, ctx) => {
            // if both `from` values missing - throw error
            if (
              isNil(value.settings.messagingServiceSid) &&
              isNil(value.fields.messagingServiceSid)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                fatal: true,
                message:
                  '"Messaging Service SID" is missing in both settings and in the action field.',
              })
            }
          }),
        payload,
      })

      const client = twilioSdk(accountSid, authToken, {
        region: 'IE1',
        accountSid,
      })

      const { sid } = await client.messages.create({
        body: addOptOutLanguage
          ? appendOptOutLanguage(message, optOutLanguage, language)
          : message,
        messagingServiceSid: messagingServiceSid ?? defaultMessagingServiceSid,
        to: recipient,
      })

      const messageSidLog = `Message SID: ${sid}`

      await onComplete({
        data_points: {
          messageSid: sid,
        },
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: messageSidLog,
            },
          },
        ],
      })
    } catch (error) {
      if (isTwilioErrorResponse(error)) {
        await onError({
          events: [parseTwilioError(error)],
        })
      } else {
        throw error
      }
    }
  },
}
