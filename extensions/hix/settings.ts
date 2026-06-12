import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiUrl: {
    label: 'API URL',
    key: 'apiUrl',
    obfuscated: false,
    required: true,
    description:
      'The full URL of the HiX task endpoint (e.g. the "incoming-task" endpoint of the demo environment).',
  },
  apiKey: {
    label: 'API key',
    key: 'apiKey',
    obfuscated: true,
    required: false,
    description:
      'Optional shared secret, sent as the "x-demo-key" header on every request.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiUrl: z.string().url({ message: 'API URL must be a valid URL' }),
  apiKey: z.string().optional(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
