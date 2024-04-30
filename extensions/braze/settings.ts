import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiUrl: {
    key: 'apiUrl',
    label: 'API url',
    obfuscated: false,
    required: true,
    description: 'The API endpoint url.',
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: true,
    required: true,
    description: 'Your Braze API key.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiUrl: z.string().min(1, {
    message: 'Missing "API URL in the extension settings."',
  }),
  apiKey: z.string().min(1, {
    message: 'Missing "API key in the extension settings."',
  }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
