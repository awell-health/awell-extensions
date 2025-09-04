import { type Setting, type Settings } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings: Settings = {
  supportSubdomain: {
    label: 'Support subdomain',
    key: 'supportSubdomain',
    obfuscated: false,
    required: true,
    description:
      'Your Zendesk subdomain (e.g., "acme" for acme.zendesk.com)',
  },
  supportEmail: {
    label: 'Support agent email',
    key: 'supportEmail',
    obfuscated: false,
    required: true,
    description: 'Zendesk agent email used for API access',
  },
  supportApiToken: {
    label: 'Support API token',
    key: 'supportApiToken',
    obfuscated: true,
    required: true,
    description:
      'Create a token in Admin Center → Apps and integrations → Zendesk API',
  },
}


export const SettingsValidationSchema = z.object({
  supportSubdomain: z.string().nonempty({
    message: 'Missing "Support subdomain" in the extension settings.',
  }),
  supportEmail: z.string().email({
    message: 'Invalid "Support agent email" in the extension settings.',
  }),
  supportApiToken: z.string().nonempty({
    message: 'Missing "Support API token" in the extension settings.',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
