import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiUrl: {
    key: 'apiUrl',
    label: 'API url',
    obfuscated: false,
    required: true,
    description: 'The environment specific API url.',
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: true,
    required: true,
    description: 'Your Healthie API key.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiUrl: z.string().nonempty({
    message: 'Missing "API URL in the extension settings."',
  }),
  apiKey: z.string().nonempty({
    message: 'Missing "API key in the extension settings."',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
