import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    obfuscated: true,
    required: true,
    description: 'Used to authenticate with Braze',
  },
  url: {
    key: 'url',
    label: 'URL',
    obfuscated: false,
    required: true,
    description: 'The URL of the Braze instance',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().min(1),
  url: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
