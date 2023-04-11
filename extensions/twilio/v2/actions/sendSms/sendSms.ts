import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import twilioSdk from '../../../common/sdk/twilio'
import { type Action } from '../../../../../lib/types'
import { type settings } from '../../../settings'
import { Category } from '../../../../../lib/types/marketplace'
import { validateSettings } from '../../../settings'
import { validateActionFields, fields } from './config'

export const sendSms: Action<typeof fields, typeof settings> = {
  key: 'sendSms',
  title: 'Send SMS',
  description: 'Send an SMS message.',
  category: Category.COMMUNICATION,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const { accountSid, authToken, fromNumber } = validateSettings(
        payload.settings
      )
      const { recipient, message } = validateActionFields(payload.fields)

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
