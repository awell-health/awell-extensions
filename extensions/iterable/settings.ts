import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodType } from 'zod'

export const settings = {
  apiKey: {
    label: 'API key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description: 'API key used to authenticate with the Iterable API',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().nonempty({
    error: 'Missing API key in the extension settings.',
  }),
} satisfies Record<keyof typeof settings, ZodType>)
