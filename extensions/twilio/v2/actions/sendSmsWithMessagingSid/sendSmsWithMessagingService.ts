import { z } from 'zod'
import twilioSdk from '../../../common/sdk/twilio'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import { isNil } from 'lodash'

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
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      settings: {
        accountSid,
        authToken,
        messagingServiceSid: defaultMessagingServiceSid,
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

    await client.messages.create({
      body: message,
      messagingServiceSid: messagingServiceSid ?? defaultMessagingServiceSid,
      to: recipient,
    })

    await onComplete()
  },
}
