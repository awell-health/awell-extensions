import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  siteId: {
    key: 'siteId',
    label: 'Site ID',
    description: 'This ID references the workspace you are working in.',
    obfuscated: false,
    required: true,
  },
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    description:
      'The API key needed to authenticate requests to the Customer.io API.',
    obfuscated: true,
    required: true,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  siteId: z.string().min(1),
  apiKey: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
