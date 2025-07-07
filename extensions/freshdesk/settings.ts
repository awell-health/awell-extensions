import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  domain: {
    key: 'domain',
    label: 'Freshdesk helpdesk domain',
    description:
      'Will be used to construct the API URL. E.g. https://<domain>.freshdesk.com/api/v2/contacts',
    required: true,
    obfuscated: false,
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    description: '',
    required: true,
    obfuscated: true,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  domain: z.string().min(1),
  apiKey: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
