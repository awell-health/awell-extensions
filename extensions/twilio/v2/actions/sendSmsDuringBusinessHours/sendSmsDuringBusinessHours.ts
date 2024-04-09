import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import twilioSdk from '../../../common/sdk/twilio'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { isEmpty, isNil } from 'lodash'
import {
  getNextDateWithinBusinessHours,
  isDateBetweenBusinessHours,
} from '../../../../../src/utils/getNextDateWithinBusinessHours'
import { formatISO } from 'date-fns'

export const sendSmsDuringBusinessHours: Action<
  typeof fields,
  typeof settings
> = {
  key: 'sendSmsDuringBusinessHours',
  title: 'Send SMS during business hours',
  description:
    'Send a text message during business hours from a given telephone number to a recipient of your choice.',
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
        },
        fields: { recipient, message, messagingServiceSid, timeZone },
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

      const tz = isEmpty(timeZone) ? 'UTC' : timeZone
      const now = new Date()
      const isBetweenBusinessHours = isDateBetweenBusinessHours(now, tz)

      const scheduleType = isBetweenBusinessHours ? undefined : 'fixed'
      const sendAt = isBetweenBusinessHours
        ? undefined
        : getNextDateWithinBusinessHours(now, tz)
      const scheduled = isBetweenBusinessHours ? 'false' : 'true'

      const res = await client.messages.create({
        body: message,
        messagingServiceSid: messagingServiceSid ?? defaultMessagingServiceSid,
        to: recipient,
        scheduleType,
        sendAt,
      })

      await onComplete({
        data_points: {
          messageSid: res.sid,
          scheduled,
          sendAt: (sendAt != null) ? formatISO(sendAt) : formatISO(now),
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'BAD_REQUEST',
                message: error.message,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
