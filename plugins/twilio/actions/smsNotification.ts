import twilioSdk from '../twilioSdk'
import {
  PluginActionFieldType,
  type PluginAction,
  type PluginActionField,
} from '../../../lib/types'
import { type settings } from '../settings'

const fields = {
  recipient: {
    id: 'recipient',
    label: 'Recipient',
    type: PluginActionFieldType.STRING,
  },
  message: {
    id: 'message',
    label: 'Message',
    type: PluginActionFieldType.TEXT,
  },
} satisfies Record<string, PluginActionField>

export const smsNotification: PluginAction<typeof fields, typeof settings> = {
  key: 'smsNotification',
  title: 'SMS via Twilio',
  category: 'Notifications',
  fields,
  onActivityCreated: async (payload, done) => {
    const {
      fields: { message, recipient },
      settings,
    } = payload
    if (recipient === undefined) {
      console.error('Recipient is not defined')
    } else {
      try {
        const client = twilioSdk(settings.accountSid, settings.authToken, {
          region: 'IE1',
          accountSid: settings.accountSid,
        })
        await client.messages.create({
          body: message,
          from: settings.fromNumber,
          to: recipient,
        })
      } catch (err) {
        console.error('Error in twilio plugin', err)
      }
    }
    await done()
  },
}
