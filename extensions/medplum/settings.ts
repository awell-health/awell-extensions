import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: true,
    required: true,
    description: 'Used to authenticate with Medplum',
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client secret',
    obfuscated: true,
    required: true,
    description: 'Used to authenticate with Medplum',
  },
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    required: false,
    description: 'Optional custom base URL for Medplum server (e.g., https://api.medplum.com/). Leave empty to use default.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  baseUrl: z.string().url().optional().or(z.literal('')),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
