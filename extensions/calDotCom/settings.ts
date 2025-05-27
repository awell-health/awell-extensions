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
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().min(1),
} satisfies Record<keyof typeof settings, z.ZodTypeAny>)
