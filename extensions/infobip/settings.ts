import { makeStringOptional, type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  baseUrl: {
    label: 'Base URL',
    key: 'baseUrl',
    obfuscated: false,
    required: true,
    description: 'Your unique API base URL',
  },
  apiKey: {
    label: 'API key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description:
      'Provide an API key that allows the extension to make API calls to the Infobip API',
  },
  fromPhoneNumber: {
    label: 'From phone number',
    key: 'fromPhoneNumber',
    obfuscated: false,
    required: false,
    description: 'The phone number you wish to use for sending text messages',
  },
  fromEmail: {
    label: 'From email',
    key: 'fromEmail',
    obfuscated: false,
    required: false,
    description:
      'The email address you wish to use for sending text messages. When you are using Broadcast templates, the from email defined in the template will be used.',
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
} satisfies Record<keyof typeof settings, ZodTypeAny>)
