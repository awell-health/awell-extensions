import { type Setting } from '@awell-health/extensions-core'
import { z } from 'zod'

export const settings = {
  apiKey: {
    label: 'API Key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description: 'Enter an API key so Awell can communicate with Cal.com.',
  },
  calOrigin: {
    label: 'Cal.com Origin',
    key: 'calOrigin',
    obfuscated: false,
    required: false,
    description:
      'Base URL for your Cal.com deployment. Defaults to https://cal.com but can be overridden for enterprise Cal.com accounts with custom domains (e.g., https://joinavela.cal.com).',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().min(1),
  calOrigin: z.string().url().optional(),
} satisfies Record<keyof typeof settings, z.ZodTypeAny>)
