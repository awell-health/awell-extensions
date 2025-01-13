import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of the Task ServiceAPI',
    required: true,
  },
  apiKey: {
    key: 'apiKey',
    label: 'API key',
    obfuscated: true,
    description: 'The API key for the Task Service API',
    required: true,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  baseUrl: z.string().min(1),
  apiKey: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
