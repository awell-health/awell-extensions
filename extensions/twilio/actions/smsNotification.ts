import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import twilioSdk from '../twilio'
import {
  FieldType,
  StringType,
  type Action,
  type Field,
} from '../../../lib/types'
import { type settings } from '../settings'
import { Category } from '../../../lib/types/marketplace'
import { Message, Phone, Settings, validate } from '../validation'

const fields = {
  recipient: {
    id: 'recipient',
    label: '"To" phone number',
    type: FieldType.STRING,
    stringType: StringType.PHONE,
    description: 'To what phone number would you like to send an SMS message?',
    required: true,
  },
  message: {
    id: 'message',
    label: 'Message',
    type: FieldType.TEXT,
    required: true,
  },
} satisfies Record<string, Field>

const Fields = Message.extend({
  recipient: Phone,
})

const Schema = z.object({
  fields: Fields,
  settings: Settings,
})

export const smsNotification: Action<typeof fields, typeof settings> = {
  key: 'smsNotification',
  title: 'Send SMS to phone number',
  description: 'Send an SMS message to a phone number.',
  category: Category.COMMUNICATION,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: { recipient, message },
        settings: { accountSid, authToken, fromNumber },
      } = validate({ schema: Schema, payload })
      const client = twilioSdk(accountSid, authToken, {
        region: 'IE1',
        accountSid,
      })
      await client.messages.create({
        body: message,
        from: fromNumber,
        to: recipient,
      })
      await onComplete()
    } catch (err) {
      console.error(err)
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
