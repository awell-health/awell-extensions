import { type Setting } from '@awell-health/extensions-core'
import { z, ZodTypeAny } from 'zod'

export const settings = {
  salesforceSubdomain: {
    key: 'salesforceSubdomain',
    label: 'Domain',
    obfuscated: false,
    required: true,
    description:
      'The unique subdomain for your SFDC tenant (e.g. https://<YOUR_SUBDOMAIN>.auth.marketingcloudapis.com). Only enter the subdomain, not the full URL.',
  },
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: false,
    required: true,
    description:
      'Client ID issued when you create the API integration in Installed Packages.',
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client secret',
    obfuscated: true,
    required: true,
    description:
      'Client secret issued when you create the API integration in Installed Packages.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  salesforceSubdomain: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
