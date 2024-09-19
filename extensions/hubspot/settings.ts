import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  accessToken: {
    key: 'accessToken',
    label: 'Access token',
    obfuscated: false,
    required: true,
    description:
      'The access token will be used to authenticate requests to the HubSpot API',
  },
  smtpUsername: {
    key: 'smtpUsername',
    label: 'SMTP Username',
    obfuscated: false,
    required: false,
    description:
      'Only required if you wish to send emails via the HubSpot SMTP API',
  },
  smtpPassword: {
    key: 'smtpPassword',
    label: 'SMTP Password',
    obfuscated: true,
    required: false,
    description:
      'Only required if you wish to send emails via the HubSpot SMTP API',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  accessToken: z.string().min(1),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
