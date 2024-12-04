import { z, type ZodTypeAny } from 'zod'
import { type Setting } from '@awell-health/extensions-core'
import { getEmailValidation } from '../../src/lib/awell'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    obfuscated: true,
    required: true,
    description:
      'Your Mailchimp API Key so the extension can authenticate with the Mailchimp API.',
  },
  fromName: {
    key: 'fromName',
    label: 'From name',
    obfuscated: false,
    required: true,
    description: 'The name that will be used for the "From" header.',
  },
  fromEmail: {
    key: 'fromEmail',
    label: 'From email',
    obfuscated: false,
    required: true,
    description: 'The email address that will be used for the "From" header.',
  },
} satisfies Record<string, Setting>

export const RegionValidationSchema = z.optional(
  z.enum(['EU', 'eu', 'US', 'us'])
)

export const SettingsValidationSchema = z.object({
  apiKey: z.string(),
  fromName: z.string(),
  fromEmail: getEmailValidation(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
