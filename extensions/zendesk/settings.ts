import {
  type Setting,
  clientCredentialsSettings,
} from '@awell-health/extensions-core'
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
  ...clientCredentialsSettings,
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  subdomain: z.string().nonempty({
    message: 'Missing "Zendesk Subdomain" in the extension settings.',
  }),
  client_id: z.string().nonempty({
    message: 'Missing "Client ID" in the extension settings.',
  }),
  client_secret: z.string().nonempty({
    message: 'Missing "Client Secret" in the extension settings.',
  }),
  auth_url: z.string().nonempty({
    message: 'Missing "Auth URL" in the extension settings.',
  }),
  audience: z.string().optional(),
})
