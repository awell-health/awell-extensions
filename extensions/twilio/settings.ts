import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'
import { E164PhoneValidationSchema } from '@awell-health/extensions-core'

export const settings = {
  accountSid: {
    label: 'Account SID',
    key: 'accountSid',
    obfuscated: true,
    required: true,
    description: 'Find your Account SID at twilio.com/console.',
  },
  authToken: {
    label: 'Auth token',
    key: 'authToken',
    obfuscated: true,
    required: true,
    description: 'Find your Auth Token at twilio.com/console.',
  },
  fromNumber: {
    label: '"From" number',
    key: 'fromNumber',
    obfuscated: false,
    required: false,
    description:
      'A Twilio phone number that you own in E.164 format which will be used to send text messages. If you are using a Messaging Service you can leave this field empty.',
  },
  messagingServiceSid: {
    label: 'Messaging Service SID',
    key: 'messagingServiceSid',
    obfuscated: false,
    required: false,
    description:
      'The SID of the Messaging Service you want to associate with the Message. If you are not using a Messaging Service but a "from" number, then you can leave this field empty.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  accountSid: z.string().min(1, { message: 'Missing Twilio account SID' }),
  authToken: z.string().min(1, { message: 'Missing Twilio auth token' }),
  fromNumber: E164PhoneValidationSchema.optional(),
  messagingServiceSid: z.string().optional(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
