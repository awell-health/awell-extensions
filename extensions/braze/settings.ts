import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  appId: {
    key: 'appId',
    label: 'App ID',
    obfuscated: false,
    required: false,
    description:
      'Specifies the app within your workspace that extension activity should be associated with. Can also be provided via the action field.',
  },
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    obfuscated: true,
    required: true,
    description: 'Used to authenticate with Braze',
  },
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    required: true,
    description: 'The base URL of the Braze instance',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  appId: z.string().optional(),
  apiKey: z.string().min(1),
  baseUrl: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
