import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const DEFAULT_BASE_URL =
  'https://guideway-care-api-855188300685.us-central1.run.app'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    description:
      'X-API-Key header value for authenticating with Guideway Care API',
    required: true,
    obfuscated: true,
  },
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    description: `Base URL for the Guideway Care API. Defaults to ${DEFAULT_BASE_URL}`,
    required: false,
    obfuscated: false,
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional().default(DEFAULT_BASE_URL),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
