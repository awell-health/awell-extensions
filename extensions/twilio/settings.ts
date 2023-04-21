import { type Setting } from '../../lib/types'
import { z, type ZodTypeAny } from 'zod'
import { E164PhoneValidationSchema } from '../../lib/shared/validation'

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
    required: true,
    description:
      '"From" specifies the Twilio phone number, short code, or messaging service that will send the text messages. This must be a Twilio phone number that you own.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  accountSid: z.string().min(1, { message: 'Missing Twilio account SID' }),
  authToken: z.string().min(1, { message: 'Missing Twilio auth token' }),
  fromNumber: E164PhoneValidationSchema,
} satisfies Record<keyof typeof settings, ZodTypeAny>)
