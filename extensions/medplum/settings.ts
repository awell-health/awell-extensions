import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  clientId: {
    key: 'clientId',
    label: 'Client ID',
    obfuscated: true,
    required: false,
    description: 'Used to authenticate with Medplum',
  },
  clientSecret: {
    key: 'clientSecret',
    label: 'Client secret',
    obfuscated: true,
    required: true,
    description: 'Used to authenticate with Medplum',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
