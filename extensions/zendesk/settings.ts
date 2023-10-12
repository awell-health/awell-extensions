import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  email: {
    label: 'Email',
    key: 'email',
    obfuscated: false,
    required: true,
    description: 'Email address connected with your account in Zendesk',
  },
  apiToken: {
    label: 'API token',
    key: 'apiToken',
    obfuscated: true,
    required: true,
    description:
      'Visit Admin Center and go to Apps and integrations > APIs > Zendesk API to enable and create API token',
  },
  subdomain: {
    label: 'Subdomain',
    key: 'subdomain',
    obfuscated: false,
    required: true,
    description: 'Subdomain is a unique identifier of your Zendesk account',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  email: z.string().email().nonempty({
    message: 'Missing "Email" in the extension settings.',
  }),
  apiToken: z.string().nonempty({
    message: 'Missing "API token" in the extension settings.',
  }),
  subdomain: z.string().nonempty({
    message: 'Missing "Subdomain" in the extension settings.',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
