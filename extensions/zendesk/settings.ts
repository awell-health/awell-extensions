import { type Setting } from '@awell-health/extensions-core'
import { z } from 'zod'

export const settings = {
  subdomain: {
    label: 'Zendesk Subdomain',
    key: 'subdomain',
    obfuscated: false,
    required: true,
    description:
      'Your Zendesk subdomain (e.g., "company" for company.zendesk.com)',
  },
  user_email: {
    label: 'User Email',
    key: 'user_email',
    obfuscated: false,
    required: true,
    description: 'Your Zendesk user email address',
  },
  api_token: {
    label: 'API Token',
    key: 'api_token',
    obfuscated: true,
    required: true,
    description: 'Your Zendesk API token',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  subdomain: z.string().nonempty({
    message: 'Missing "Zendesk Subdomain" in the extension settings.',
  }),
  user_email: z.string().email({
    message: 'Invalid "User Email" in the extension settings.',
  }),
  api_token: z.string().nonempty({
    message: 'Missing "API Token" in the extension settings.',
  }),
})
