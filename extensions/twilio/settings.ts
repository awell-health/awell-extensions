import {
  E164PhoneValidationOptionalSchema,
  type Setting,
} from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

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
  addOptOutLanguage: {
    label: 'Add opt-out language',
    key: 'addOptOutLanguage',
    obfuscated: false,
    required: false,
    description: `On by default, set to "Off" if you don't want to add opt-out language to your text messages.`,
  },
  optOutLanguage: {
    label: 'Opt-out language',
    key: 'optOutLanguage',
    obfuscated: false,
    required: false,
    description:
      'The sentence that is appended at the end of your text messages that informs recipients of how they can opt out. If not specified, standard opt-out language is appended to your messages.',
  },
  language: {
    label: 'Language',
    key: 'language',
    obfuscated: false,
    required: false,
    description:
      'The language you are sending text messages in. Possible options: fr, en (default), nl.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  accountSid: z.string().min(1, { message: 'Missing Twilio account SID' }),
  authToken: z.string().min(1, { message: 'Missing Twilio auth token' }),
  fromNumber: E164PhoneValidationOptionalSchema,
  messagingServiceSid: z.string().optional(),
  addOptOutLanguage: z
    .string()
    .toLowerCase()
    .optional()
    .transform((arg) => {
      if (arg === 'off') return false

      return true
    }),
  optOutLanguage: z.string().optional(),
  language: z
    .union([z.enum(['en', 'fr', 'nl']), z.literal('')])
    .default('en')
    .transform((arg) => {
      if (arg === '') return 'en'

      return arg
    }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
