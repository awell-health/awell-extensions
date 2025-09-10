import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  subdomain: {
    label: 'Zendesk Subdomain',
    key: 'subdomain',
    obfuscated: false,
    required: true,
    description:
      'Your Zendesk subdomain (e.g., "company" for company.zendesk.com)',
  },
  access_token: {
    label: 'OAuth Access Token',
    key: 'access_token',
    obfuscated: true,
    required: true,
    description: 'OAuth access token for Zendesk API authentication',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  subdomain: z.string().nonempty({
    message: 'Missing "Zendesk Subdomain" in the extension settings.',
  }),
  access_token: z.string().nonempty({
    message: 'Missing "OAuth Access Token" in the extension settings.',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
