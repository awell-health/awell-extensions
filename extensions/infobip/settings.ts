import { makeStringOptional, type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  baseUrl: {
    label: 'Base URL',
    key: 'baseUrl',
    obfuscated: false,
    required: true,
    description: 'Your unique API base URL.',
  },
  apiKey: {
    label: 'API key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description:
      'Go to Dashboard > Developer tools > API keys to create a key.',
  },
  fromPhoneNumber: {
    label: 'From phone number',
    key: 'fromPhoneNumber',
    obfuscated: false,
    required: false,
    description: 'Phone number from which you want to send text messages.',
  },
  fromEmail: {
    label: 'From email',
    key: 'fromEmail',
    obfuscated: false,
    required: false,
    description: 'Email from which you want to send email messages.',
  },
  replyTo: {
    label: 'Reply to',
    key: 'replyTo',
    obfuscated: false,
    required: false,
    description: 'Email address to which recipients of the email can reply.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  baseUrl: z.string().url().nonempty({
    message: 'Missing "Base URL" in the extension settings.',
  }),
  apiKey: z.string().nonempty({
    message: 'Missing "API key" in the extension settings.',
  }),
  fromPhoneNumber: makeStringOptional(z.string()),
  fromEmail: makeStringOptional(z.string().email()),
  replyTo: makeStringOptional(z.string().email()),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
